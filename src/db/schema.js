const schema = `
    CREATE TABLE IF NOT EXISTS users (
        id   INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT NOT NULL, 
        email TEXT NOT NULL UNIQUE, 
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('employee','manager')),
        annual_leave_entitlement INTEGER NOT NULL DEFAULT 20,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leave_requests  (
        id INTEGER PRIMARY KEY  AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        leave_type TEXT NOT NULL CHECK (leave_type in ('annual','sick','unpaid')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
        reason TEXT,
        approved_by INTEGER,
        rejected_by INTEGER,
        rejection_reason TEXT,
        working_days INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (approved_by) REFERENCES users(id),
        FOREIGN KEY (rejected_by) REFERENCES users(id)


    );
`

module.exports = schema