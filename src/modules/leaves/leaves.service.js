const {getDb} = require('../../config/database')
const { isValidDate,today,countWorkingDays} = require('../../utils/dates')
const {Errors} = require('../../utils/errors')

function getBalance(userId)
{
    const db = getDb()
    const year = new Date().getFullYear()

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

    const approvedLeaveRequests = db.prepare(`SELECT working_days, start_date FROM leave_requests 
        WHERE user_id = ? 
        AND leave_type = 'annual' 
        AND status = 'approved'`)
        .all(userId)

    const taken = approvedLeaveRequests.filter(l => new Date(l.start_date).getFullYear() === year).reduce((sum,l) => sum+l.working_days,0)

    const remaining = user.annual_leave_entitlement - taken
    return {year, entitlement: user.annual_leave_entitlement , taken,  remaining}
}

function submitLeave( userId, {start_date, end_date, leave_type, reason})
{
    const db = getDb();

    const validTypes = ['annual', 'sick', 'unpaid'];
    if (!validTypes.includes(leave_type)) {
        throw Errors.validation('leave_type must be annual, sick or unpaid');
    }

    if (!isValidDate(start_date) || !isValidDate(end_date)) {
        throw Errors.validation('Dates must be in correct format');
    }

    if (end_date < start_date) {
        throw Errors.validation('End date must be greater than or equal to start date');
    }

    if (start_date < today()) {
        throw Errors.pastDate();
    }

    const workingDays = countWorkingDays(start_date, end_date);
    if (workingDays === 0) {
        throw Errors.weekendOnly();
    }

    const overlap = db.prepare(`
        SELECT id FROM leave_requests 
        WHERE user_id = ? 
          AND status = 'approved' 
          AND start_date <= ? 
          AND end_date >= ?
    `).get(userId, end_date, start_date);

    if (overlap) throw Errors.overlap();

    if (leave_type === 'annual') {
        const balance = getBalance(userId);
        if (workingDays > balance.remaining) {
            throw Errors.insufficientBalance(balance.remaining, workingDays);
        }
    }

    const result = db.prepare(`
        INSERT INTO leave_requests (user_id, start_date, end_date, leave_type, reason, working_days, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).run(userId, start_date, end_date, leave_type, reason || null, workingDays);

    return db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(result.lastInsertRowid);
}

function getMyLeave(userId, leaveId)
{
    const db = getDb()
    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ? AND user_id = ?').get(leaveId, userId)
    if(!leave) throw Errors.notFound('Leave request')
        return leave
}

function cancelLeave(userId,leaveId)
{
    const db = getDb()
    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId )

    if(!leave) throw Errors.notFound('Leave request')
    if(leave.user_id !== userId) throw Errors.forbiden('You can only cancel your own leave requests')
    if(leave.status !== 'pending') throw Errors.alreadyProcessed()

    db.prepare(`UPDATE leave_requests SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?`).run(leaveId);

    return db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId)
}

function rejectLeave(managerId,leaveId, reason)
{
    const db =getDb()
    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId)

    if(!leave) throw Errors.notFound('leave request')
    if(leave.status !== 'pending') throw Errors.alreadyProcessed()
    if(leave.user_id === managerId) throw Errors.ownLeave()

    db.prepare(`UPDATE leave_requests SET status = 'rejected', rejected_by = ?, rejection_reason = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(managerId, reason || null, leaveId)

    return db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId)

}

function approveLeave(managerId, leaveId)
{
    const db = getDb()
    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId)

    if(!leave) throw Errors.notFound('Leave requests')
    
    if(leave.status !== 'pending') throw Errors.alreadyProcessed()


    if(leave.user_id === managerId) throw Errors.ownLeave()

    const overlap = db.prepare(`
            SELECT id FROM leave_requests
            WHERE user_id = ?
            AND status = 'approved'
            AND start_date <= ?
            AND end_date >= ?
            and id != ?
        `).get(leave.user_id, leave.end_date, leave.start_date, leaveId)

        if(overlap) throw Errors.overlap()

    if(leave.leave_type === 'annual')
    {
        const balance = getBalance(leave.user_id)
        if(leave.working_days > balance.remaining)
        {
            throw Errors.insufficientBalance(balance.remaining, leave.working_days)
        }
    }

    db.prepare(`
            UPDATE leave_requests SET status = 'approved', approved_by = ?, updated_at =datetime('now')
            WHERE id = ?
        `).run(managerId,leaveId)


    return db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(leaveId)
}

function listMyLeaves(userId, filters = {}) {
    const db = getDb();
    let query = 'SELECT * FROM leave_requests WHERE user_id = ?';
    const params = [userId];

    if (filters.status) {
        const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
        if (!validStatuses.includes(filters.status)) {
            throw Errors.validation(`status must be one of: ${validStatuses.join(', ')}.`);
        }

        query += ' AND status = ?';
        params.push(filters.status); 
    }

    if (filters.leave_type) {
        const validTypes = ['annual', 'sick', 'unpaid'];
        if (!validTypes.includes(filters.leave_type)) {
            throw Errors.validation(`leave_type must be one of: ${validTypes.join(', ')}.`);
        }
        
        query += ' AND leave_type = ?';
        params.push(filters.leave_type);
    }

    if (filters.from) {
        if (!isValidDate(filters.from)) throw Errors.validation('from must be YYYY-MM-DD');

        query += ' AND end_date >= ?';
        params.push(filters.from);
    }

    if (filters.to) {
        if (!isValidDate(filters.to)) throw Errors.validation('to must be YYYY-MM-DD');
        
        query += ' AND start_date <= ?'; 
        params.push(filters.to);
    }

    query += ' ORDER BY created_at DESC';
    
    return db.prepare(query).all(...params);
}

function listPendingLeaves(filters = {})
{
    const db = getDb()
    let query = `
        SELECT lr.*, u.name as requester_name, u.email as requester_email 
        FROM leave_requests lr
        JOIN users u ON u.id = lr.user_id
        WHERE lr.status = 'pending'
    `;
    const params = [];

    if(filters.user_id)
    {
        query += ' AND lr.user_id = ?'
        params.push(Number(filters.user_id))
    }

    if(filters.from)
    {
        if(!isValidDate(filters.from)) throw Errors.validation('to must be YYYY-MM-DD')
            query += ' AND lr.end_date >= ?'
        params.push(filters.from)
    }
    
    if(filters.to)
    {
        if(!isValidDate(filters.to)) throw Errors.validation('to must be YYYY-MM-DD')
        query += ' AND lr.start_date <= ?'
        params.push(filters.to)
    }

    query += ' ORDER BY lr.created_at ASC'

    return db.prepare(query).all(...params)
}

module.exports = { 
    getBalance, 
    submitLeave ,
    getMyLeave ,
    cancelLeave , 
    rejectLeave ,
    approveLeave,
    listMyLeaves, 
    listPendingLeaves
};