


function countWorkingDays(startDate, endDate)
{
    let currDate = new Date(startDate)
    let finalDate = new Date(endDate)
    let count = 0

    while(currDate <= finalDate)
    {
        const day = currDate.getDay()
        if(day !== 6 && day !== 0)
        {
            count++
        }

        currDate.setDate( currDate.getDate() +1)

    }

    return count
}

function isValidDate(dateStr)
{
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false

    const d = new Date(dateStr)
    return d instanceof Date && !isNaN(d)
}

function today(){ return new Date().toISOString().split('T')[0]}

module.exports = {countWorkingDays,isValidDate,today}