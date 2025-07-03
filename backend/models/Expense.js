// models/Expense.js
const pool = require('../utils/db'); // <-- UPDATED PATH

// ... (rest of your Expense.js code remains the same) ...
// The createExpensesTable function will now correctly access 'pool'
async function createExpensesTable() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS expenses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            userId INT NOT NULL,
            title VARCHAR(255) NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            category VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
    `;
    try {
        await pool.execute(createTableQuery); // This line will now work
        console.log('✅ Expenses table ensured to exist in MySQL.');
    } catch (error) {
        console.error('❌ Error ensuring expenses table:', error);
        process.exit(1);
    }
}
createExpensesTable();

async function addExpense(userId, title, amount, category, date) {
    try {
        let actualDateToStore;
        if (date instanceof Date) {
            // Get local year, month, day and format manually
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
            const day = String(date.getDate()).padStart(2, '0');
            actualDateToStore = `${year}-${month}-${day}`;
        } else {
            // Assume it's already a 'YYYY-MM-DD' string if not a Date object
            actualDateToStore = date;
        }

        const tempDate = new Date(actualDateToStore); // This might implicitly treat it as UTC if no timezone is specified
        tempDate.setDate(tempDate.getDate() + 1); // Add one day

        const yearCorrected = tempDate.getFullYear();
        const monthCorrected = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dayCorrected = String(tempDate.getDate()).padStart(2, '0');
        const finalFormattedDate = `${yearCorrected}-${monthCorrected}-${dayCorrected}`;


        console.log("Backend (Expense.js - addExpense): Date sent to MySQL:", finalFormattedDate);
        const [result] = await pool.execute(
            'INSERT INTO expenses (userId, title, amount, category, date) VALUES (?, ?, ?, ?, ?)',
            [userId, title, amount, category, finalFormattedDate]
        );
        return { insertId: result.insertId };
    } catch (error) {
        console.error('Error in addExpense:', error);
        throw error;
    }
}

async function updateExpense(id, userId, title, amount, category, date) {
    try {
        let formattactualDateToStoreedDate;
        if (date instanceof Date) {
            // Get local year, month, day and format manually
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            actualDateToStore = `${year}-${month}-${day}`;
        } else {
            actualDateToStore = date;
        }

        const tempDate = new Date(actualDateToStore); // This might implicitly treat it as UTC if no timezone is specified
        tempDate.setDate(tempDate.getDate() + 1); // Add one day

        const yearCorrected = tempDate.getFullYear();
        const monthCorrected = String(tempDate.getMonth() + 1).padStart(2, '0');
        const dayCorrected = String(tempDate.getDate()).padStart(2, '0');
        const finalFormattedDate = `${yearCorrected}-${monthCorrected}-${dayCorrected}`;

        console.log("Backend (Expense.js - updateExpense): Date sent to MySQL:", finalFormattedDate);
        const [result] = await pool.execute(
            'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ? WHERE id = ? AND userId = ?',
            [title, amount, category, finalFormattedDate, id, userId]
        );
        return { affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error in updateExpense:', error);
        throw error;
    }
}


async function deleteExpense(expenseId, userId) {
    try {
        const [result] = await pool.execute(
            'DELETE FROM expenses WHERE id = ? AND userId = ?',
            [expenseId, userId]
        );
        // `result` here will contain properties like `affectedRows`
        return { affectedRows: result.affectedRows };
    } catch (error) {
        console.error('Error in deleteExpense:', error);
        throw error; // Re-throw to be caught by the controller's try-catch
    }
}
async function findExpensesByUserId(userId) {
    try {
        const [rows] = await pool.execute('SELECT id, title, amount, category, date FROM expenses WHERE userId = ? ORDER BY date DESC', [userId]);
        return rows; // This should always be an array (even if empty)
    } catch (error) {
        console.error('Error in findExpensesByUserId:', error); // Add error log here too
        throw error; // Re-throw the error
    }
}
async function getCategorySummaryByUserId(userId) {
    try {
        const [rows] = await pool.execute(
            'SELECT category AS id, SUM(amount) AS total FROM expenses WHERE userId = ? GROUP BY category',
            [userId]
        );
        return rows; // This should also be an array
    } catch (error) {
        console.error('Error in getCategorySummaryByUserId:', error); // Add error log here too
        throw error; // Re-throw the error
    }
}

module.exports = {
    addExpense,
    updateExpense,
    deleteExpense,
    findExpensesByUserId,
    getCategorySummaryByUserId,
};