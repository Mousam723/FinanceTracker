import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getExpenses, addExpense, updateExpense, deleteExpense, getSummary } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PlusCircle, CalendarDays, BarChart, XCircle, Trash2, Edit2 } from 'lucide-react'; // Icons

// Utility function to format currency for Indian Rupees
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
};


// Define color palette for different categories in charts
const COLORS = {
    Income: '#4CAF50',         // Green for positive income
    Needs: '#FFC107',          // Amber/Yellow for essential expenses
    Wants: '#F44336',          // Red for discretionary spending
    Save: '#2196F3',           // Blue for savings/investments
    'Remaining Income': '#E0E0E0' // Light Gray for unspent income in pie chart
};

// Helper function to get the current date in YYYY-MM-DD format
const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate =`${year}-${month}-${day}`;
    console.log("getCurrentDate() returns:", formattedDate);
    return formattedDate;
};

// Helper function to get the month name and year (e.g., "June 2025")
const getMonthName = (year, monthIndex) => {
    const date = new Date(year, monthIndex);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

// Main Dashboard Component
const Dashboard = () => {
    const { user } = useAuth(); // Destructure logout for potential use
    
    console.log("Dashboard Render: user object from useAuth:", user);
    // console.log("Dashboard Render: user?.token:", user?.token);

    const [expenses, setExpenses] = useState([]); // All expenses fetched from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // UI-specific states
    const [showAddForm, setShowAddForm] = useState(false); // Controls visibility of Add/Edit form
    const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' or 'monthlyReport'
    const [selectedDate, setSelectedDate] = useState(getCurrentDate()); // Date for dashboard view
    // Form state for adding/editing transactions
    const [form, setForm] = useState({
        title: '',
        amount: '',
        category: 'Needs', // Default category
        date: getCurrentDate(), // Default to current date
    });
    const [editingId, setEditingId] = useState(null); // ID of the expense being edited
    // States for Monthly Report
    const [selectedMonthIndex, setSelectedMonthIndex] = useState(new Date().getMonth());
    const [selectedMonthYear, setSelectedMonthYear] = useState(new Date().getFullYear());
    // State for deletion confirmation UI
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteTitle, setDeleteTitle] = useState('');
    const [categorySummary, setCategorySummary] = useState([]);


    // --- Data Fetching Effect ---

    const fetchData = useCallback(async () => {
        const token = user?.token;
        console.log("fetchData: Attempting to fetch with token:", token); // Log the actual token value
        if (!token) {
            console.warn("fetchData: Token is missing, cannot fetch expenses."); // Changed to warn
            setError("Unauthorized: No token found. Please log in."); //
            setExpenses([]);
            setCategorySummary([]);
            setLoading(false);
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const expensesResponse = await getExpenses();
            const expensesData = expensesResponse.data;

            if (!Array.isArray(expensesData)) {
                console.error("fetchData: Expenses data is not an array:", expensesData);
                setError("Unexpected data format for expenses. Please try again.");
                setExpenses([]);
                return;
            }
            const formattedExpenses = expensesData.map(exp => ({
                ...exp,
                date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : '',
            }));
            setExpenses(formattedExpenses);

            const summaryResponse = await getSummary();
            const summaryData = summaryResponse.data;

            if (!Array.isArray(summaryData)) {
                console.error("fetchData: Summary data is not an array:", summaryData);
                setCategorySummary([]);
                return;
            }
            setCategorySummary(summaryData);

            console.log("fetchData completed successfully.");

        } catch (error) {
            console.error('Error fetching data:', error.response ? error.response.data : error.message);
            const message = error.response && error.response.data && error.response.data.message
                ? error.response.data.message
                : 'Failed to load data. Please check your network or try again.';
            setError(message);
            setExpenses([]);
            setCategorySummary([]);
        } finally {
            setLoading(false);
        }
    }, [user?.token]); // Depend on user and logout to re-fetch if user changes/logs out

    useEffect(() => {
        // This useEffect is good for triggering fetchData when user?.token becomes available.
        // The check localStorage.getItem('token') here is redundant if user?.token already works.
        // You can simplify it to just:
        console.log("Dashboard useEffect: user?.token changed, checking if we should fetch data...", user?.token);
        if (user?.token) { // Only call fetchData if user object actually has a token
             fetchData();
        } else {
             // If no token from useAuth, set loading false after initial render
             setLoading(false);
             setError("No user token found from authentication."); // Informative error
        }
    }, [user?.token, fetchData]);
    
    // --- Handlers for Add/Edit Form ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(categorySummary);
        // Basic client-side validation
        if (!form.title.trim() || !form.amount || parseFloat(form.amount) <= 0) {
            setError('Please enter a valid title and a positive amount.');
            return;
        }
        if (!user?.token) {
            setError("You are not logged in. Please log in again.");
            return;
        }

        setLoading(true); // Indicate loading
        setError(null); // Clear previous errors

        try {
            const expenseDataToSend = {
                title: form.title,
                amount: parseFloat(form.amount), // Ensure amount is a number
                category: form.category,
                date: form.date, // Ensure amount is number
                // Ensure date is sent in a format backend expects (likely ISO string or YYYY-MM-DD)
                // If backend expects ISO string, adjust: new Date(form.date).toISOString()
                // For now, form.date (YYYY-MM-DD) is fine as per your existing code
            };

            console.log("Frontend (Dashboard.js): Date being sent to backend:", expenseDataToSend.date);

            if (editingId) {
                // Update an existing expense
                await updateExpense(editingId, expenseDataToSend);
                setEditingId(null); // Clear editing state
            } else {
                // Add a new expense
                await addExpense(expenseDataToSend);
            }

            await fetchData();
            // Reset form and close it
            setForm({ title: '', amount: '', category: 'Needs', date: getCurrentDate() });
            setShowAddForm(false);
        } catch (err) {
            console.error('Error adding/updating expense:', err);
            setError('Failed to save expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers for Edit/Delete Actions on Transactions ---
    const handleEdit = useCallback((expense) => {
        // Prepare form with existing expense data for editing
        setForm({
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: expense.date,
        });
        // Change from expense._id to expense.id
        setEditingId(expense.id); // <-- CHANGE THIS LINE
        setShowAddForm(true);
    }, []);

    const handleDeleteClick = useCallback((id, title) => {
        setDeleteId(id);
        setDeleteTitle(title);
        setShowConfirmDelete(true);
    }, []);

    const confirmDelete = async () => {
        setError(null);
        const token = user?.token; // Get token directly from the 'user' object
        if (!token) {
            setError("You are not logged in. Please log in again.");
            return;
        }
        try {
            // The deleteExpense service function needs to receive the correct integer ID
            // (This part of the code implicitly relies on deleteId being set correctly by handleDeleteClick)
            // Ensure your deleteExpense service function sends this ID in the URL correctly
            // e.g., axios.delete(`/api/expenses/${deleteId}`, ...)
            await deleteExpense(deleteId);
    
            // Change from exp._id to exp.id for filtering the state
            setExpenses(prev => prev.filter(exp => exp.id !== deleteId)); // <-- CHANGE THIS LINE
        } catch (err) {
            console.error('Error deleting expense:', err);
            setError('Failed to delete expense. Please try again.');
        } finally {
            setShowConfirmDelete(false);
            setDeleteId(null);
            setDeleteTitle('');
        }
    };

    const cancelDelete = () => {
        setShowConfirmDelete(false);
        setDeleteId(null);
        setDeleteTitle('');
    };

    // --- Memoized Data Calculations for UI ---

    // Transactions for the selected date (Dashboard view)
    const filteredTransactionsByDate = useMemo(() => {
        return expenses.filter(t => t.date === selectedDate);
    }, [expenses, selectedDate]);

    // Daily financial summary and pie chart data
    const dailyFinancials = useMemo(() => {
        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;
        let totalSaves = 0;

        filteredTransactionsByDate.forEach(t => {
            if (t.category === 'Income') totalIncome += t.amount;
            else if (t.category === 'Needs') totalNeeds += t.amount;
            else if (t.category === 'Wants') totalWants += t.amount;
            else if (t.category === 'Save') totalSaves += t.amount;
        });

        const totalExpenses = totalNeeds + totalWants;
        const netBalance = totalIncome - totalExpenses - totalSaves;

        let pieChartData = [];
        const totalExpenditureAndSave = totalNeeds + totalWants + totalSaves;

        if (totalIncome > 0) {
            if (totalIncome >= totalExpenditureAndSave) {
                if (totalNeeds > 0) pieChartData.push({ name: 'Needs', value: totalNeeds });
                if (totalWants > 0) pieChartData.push({ name: 'Wants', value: totalWants });
                if (totalSaves > 0) pieChartData.push({ name: 'Save', value: totalSaves });
                const remainingIncome = totalIncome - totalExpenditureAndSave;
                if (remainingIncome > 0) pieChartData.push({ name: 'Remaining Income', value: remainingIncome });
            } else {
                if (totalNeeds > 0) pieChartData.push({ name: 'Needs', value: totalNeeds });
                if (totalWants > 0) pieChartData.push({ name: 'Wants', value: totalWants });
                if (totalSaves > 0) pieChartData.push({ name: 'Save', value: totalSaves });
            }
        } else {
            if (totalNeeds > 0) pieChartData.push({ name: 'Needs', value: totalNeeds });
            if (totalWants > 0) pieChartData.push({ name: 'Wants', value: totalWants });
            if (totalSaves > 0) pieChartData.push({ name: 'Save', value: totalSaves });
        }

        if (pieChartData.length === 0 && totalIncome > 0) {
            pieChartData.push({ name: 'Remaining Income', value: totalIncome });
        }

        return {
            totalIncome,
            totalExpenses,
            totalNeeds,
            totalWants,
            totalSaves,
            netBalance,
            pieChartData,
        };
    }, [filteredTransactionsByDate]);

    // Monthly financial summaries for the Monthly Report view
    const monthlyFinancials = useMemo(() => {
        const firstDayOfMonth = new Date(selectedMonthYear, selectedMonthIndex, 1);
        const lastDayOfMonth = new Date(selectedMonthYear, selectedMonthIndex + 1, 0);

        const monthlyTransactions = expenses.filter(t => {
            const transactionDate = new Date(t.date); // t.date is YYYY-MM-DD
            return transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth;
        });

        let totalIncome = 0;
        let totalNeeds = 0;
        let totalWants = 0;
        let totalSaves = 0;

        monthlyTransactions.forEach(t => {
            if (t.category === 'Income') totalIncome += t.amount;
            else if (t.category === 'Needs') totalNeeds += t.amount;
            else if (t.category === 'Wants') totalWants += t.amount;
            else if (t.category === 'Save') totalSaves += t.amount;
        });

        const totalExpenses = totalNeeds + totalWants;
        const netBalance = totalIncome - totalExpenses - totalSaves;

        const needsPercentage = totalIncome > 0 ? (totalNeeds / totalIncome) * 100 : 0;
        const wantsPercentage = totalIncome > 0 ? (totalWants / totalIncome) * 100 : 0;
        const savesPercentage = totalIncome > 0 ? (totalSaves / totalIncome) * 100 : 0;

        return {
            totalIncome,
            totalExpenses,
            totalNeeds,
            totalWants,
            totalSaves,
            netBalance,
            needsPercentage,
            wantsPercentage,
            savesPercentage,
        };
    }, [expenses, selectedMonthIndex, selectedMonthYear]);

    // Custom label rendering function for Pie Chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        if (value === 0 || percent < 0.05) return null; // Don't render small slices

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-semibold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <p className="text-xl text-gray-700">Loading your financial data...</p>
        </div>
    );
    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-800 p-4 rounded">
            <p className="text-xl">{error}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800 flex flex-col">
            {/* Header/Navigation Bar */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center rounded-b-lg">
                <h1 className="text-3xl font-bold text-indigo-700">Finance Tracker</h1>
                <nav className="flex space-x-4">
                    {/* Dashboard Navigation Button */}
                    <button
                        onClick={() => setCurrentPage('dashboard')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'
                        }`}
                    >
                        <CalendarDays className="inline-block mr-2" size={18} /> Dashboard
                    </button>
                    {/* Monthly Report Navigation Button */}
                    <button
                        onClick={() => setCurrentPage('monthlyReport')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === 'monthlyReport' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-700 hover:bg-indigo-100'
                        }`}
                    >
                        <BarChart className="inline-block mr-2" size={18} /> Monthly Report
                    </button>
                </nav>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow p-6 container mx-auto max-w-7xl">
                {/* Dashboard Page Content */}
                {currentPage === 'dashboard' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Financial Summary & Add Expense Section */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Financial Overview Card for the Selected Day */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4 text-indigo-700">Financial Overview (Selected Day)</h2>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-medium">Total Income:</span>
                                        <span className="text-green-600 font-bold">{formatCurrency(dailyFinancials.totalIncome)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="font-medium">Total Expenses:</span>
                                        <span className="text-red-600 font-bold">{formatCurrency(dailyFinancials.totalExpenses)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl pt-2 border-t border-gray-200 mt-2">
                                        <span className="font-bold">Net Balance:</span>
                                        <span className={`font-bold ${dailyFinancials.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                            {formatCurrency(dailyFinancials.netBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* "Add New Transaction" Button */}
                            <button
                                onClick={() => {
                                    setShowAddForm(!showAddForm);
                                    // Reset form and editing state when toggling
                                    if (showAddForm) {
                                        setForm({ title: '', amount: '', category: 'Needs', date: getCurrentDate() });
                                        setEditingId(null);
                                    }
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 flex items-center justify-center space-x-2 transform hover:scale-105"
                            >
                                {showAddForm ? <XCircle size={20} /> : <PlusCircle size={20} />}
                                <span>{editingId ? 'Edit Transaction' : (showAddForm ? 'Close Form' : 'Add New Transaction')}</span>
                            </button>

                            {/* Add/Edit Transaction Form (Conditionally rendered) */}
                            {showAddForm && (
                                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                    <h2 className="text-xl font-semibold mb-4 text-indigo-700">{editingId ? "Edit Transaction" : "Add Transaction"}</h2>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Title Input */}
                                        <div>
                                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                            <input
                                                type="text"
                                                id="title"
                                                name="title"
                                                value={form.title}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g., Groceries, Salary"
                                                required
                                            />
                                        </div>
                                        {/* Amount Input */}
                                        <div>
                                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                            <input
                                                type="number"
                                                id="amount"
                                                name="amount"
                                                value={form.amount}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="e.g., 500"
                                                required
                                                min="0.01"
                                                step="0.01"
                                            />
                                        </div>
                                        {/* Category Select Dropdown */}
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                id="category"
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="Income">Income</option>
                                                <option value="Needs">Needs</option>
                                                <option value="Wants">Wants</option>
                                                <option value="Save">Save</option> {/* Standardized to 'Save' */}
                                            </select>
                                        </div>
                                        {/* Date Input */}
                                        <div>
                                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                id="date"
                                                name="date"
                                                value={form.date}
                                                onChange={handleChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                                required
                                            />
                                        </div>
                                        {/* Submit Button for adding/updating transaction */}
                                        <button
                                            type="submit"
                                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 transform hover:scale-105"
                                        >
                                            {editingId ? "Update Transaction" : "Add Transaction"}
                                        </button>
                                        {editingId && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingId(null);
                                                    setForm({ title: '', amount: '', category: 'Needs', date: getCurrentDate() });
                                                    setShowAddForm(false);
                                                }}
                                                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all duration-300 mt-2"
                                            >
                                                Cancel Edit
                                            </button>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>

                        {/* Right Column: Transaction List & Pie Chart */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Transaction List with Date Filter */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold text-indigo-700">Transactions on {selectedDate}</h2>
                                    {/* Date input for filtering transactions */}
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>

                                {/* Scrollable Transaction List Table */}
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {filteredTransactionsByDate.length > 0 ? (
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Time</th> */}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredTransactionsByDate.map(transaction => (
                                                    <tr key={transaction.id}>
                                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.time}</td> */}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{transaction.title}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                                                ${transaction.category === 'Income' ? 'bg-green-100 text-green-800' :
                                                                  transaction.category === 'Needs' ? 'bg-yellow-100 text-yellow-800' :
                                                                  transaction.category === 'Wants' ? 'bg-red-100 text-red-800' :
                                                                  'bg-blue-100 text-blue-800'}`}
                                                            >
                                                                {transaction.category}
                                                            </span>
                                                        </td>
                                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                                                            transaction.category === 'Income' ? 'text-green-600' : 'text-gray-900'
                                                        }`}>
                                                            {formatCurrency(transaction.amount)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                            {/* Edit Transaction Button */}
                                                            <button
                                                                onClick={() => handleEdit(transaction)}
                                                                className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                                                                title="Edit transaction"
                                                            >
                                                                <Edit2 size={18} />
                                                            </button>
                                                            {/* Delete Transaction Button */}
                                                            <button
                                                                onClick={() => handleDeleteClick(transaction.id, transaction.title)}
                                                                className="text-red-600 hover:text-red-900 transition-colors duration-200"
                                                                title="Delete transaction"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-center text-gray-500 py-8">No transactions found for {selectedDate}.</p>
                                    )}
                                </div>
                            </div>

                            {/* Pie Chart for Income Allocation */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                                <h2 className="text-xl font-semibold mb-4 text-indigo-700">Income Allocation (Selected Day)</h2>
                                {dailyFinancials.pieChartData && dailyFinancials.pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={dailyFinancials.pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomizedLabel}
                                                outerRadius={120}
                                                dataKey="value"
                                            >
                                                {dailyFinancials.pieChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatCurrency(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">No data to display for the pie chart for {selectedDate}.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Monthly Report Page Content */}
                {currentPage === 'monthlyReport' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-indigo-700">Monthly Report: {getMonthName(selectedMonthYear, selectedMonthIndex)}</h2>
                            <div className="flex space-x-2">
                                {/* Month Selector Dropdown */}
                                <select
                                    value={selectedMonthIndex}
                                    onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value))}
                                    className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {[...Array(12).keys()].map(i => (
                                        <option key={i} value={i}>{new Date(2000, i).toLocaleString('en-US', { month: 'long' })}</option>
                                    ))}
                                </select>
                                {/* Year Selector Dropdown */}
                                <select
                                    value={selectedMonthYear}
                                    onChange={(e) => setSelectedMonthYear(parseInt(e.target.value))}
                                    className="border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {[new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Monthly Financial Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {/* Overall Monthly Summary Card */}
                            <div className="bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-700 mb-3">Overall Summary</h3>
                                <p className="flex justify-between items-center text-md">
                                    <span className="font-medium">Total Income:</span>
                                    <span className="text-green-600 font-bold">{formatCurrency(monthlyFinancials.totalIncome)}</span>
                                </p>
                                <p className="flex justify-between items-center text-md">
                                    <span className="font-medium">Total Expenses:</span>
                                    <span className="text-red-600 font-bold">{formatCurrency(monthlyFinancials.totalExpenses)}</span>
                                </p>
                                <p className="flex justify-between items-center text-xl mt-3 pt-3 border-t border-gray-200">
                                    <span className="font-bold">Net Balance:</span>
                                    <span className={`font-bold ${monthlyFinancials.netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                        {formatCurrency(monthlyFinancials.netBalance)}
                                    </span>
                                </p>
                            </div>

                            {/* Needs Category Summary Card */}
                            <div className="bg-yellow-50 p-5 rounded-lg shadow-sm border border-yellow-200">
                                <h3 className="text-lg font-semibold text-yellow-800 mb-3">Needs</h3>
                                <p className="flex justify-between items-center text-md mb-2">
                                    <span className="font-medium">Amount Spent:</span>
                                    <span className="font-semibold">{formatCurrency(monthlyFinancials.totalNeeds)}</span>
                                </p>
                                <p className="flex justify-between items-center text-md">
                                    <span className="font-medium">Percentage of Income:</span>
                                    <span className="font-semibold">{monthlyFinancials.needsPercentage.toFixed(2)}%</span>
                                </p>
                            </div>

                            {/* Wants Category Summary Card */}
                            <div className="bg-red-50 p-5 rounded-lg shadow-sm border border-red-200">
                                <h3 className="text-lg font-semibold text-red-800 mb-3">Wants</h3>
                                <p className="flex justify-between items-center text-md mb-2">
                                    <span className="font-medium">Amount Spent:</span>
                                    <span className="font-semibold">{formatCurrency(monthlyFinancials.totalWants)}</span>
                                </p>
                                <p className="flex justify-between items-center text-md">
                                    <span className="font-medium">Percentage of Income:</span>
                                    <span className="font-semibold">{monthlyFinancials.wantsPercentage.toFixed(2)}%</span>
                                </p>
                            </div>

                            {/* Save Category Summary Card */}
                            <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">Saves</h3>
                                <p className="flex justify-between items-center text-md mb-2">
                                    <span className="font-medium">Amount Saved:</span>
                                    <span className="font-semibold">{formatCurrency(monthlyFinancials.totalSaves)}</span>
                                </p>
                                <p className="flex justify-between items-center text-md">
                                    <span className="font-medium">Percentage of Income:</span>
                                    <span className="font-semibold">{monthlyFinancials.savesPercentage.toFixed(2)}%</span>
                                </p>
                            </div>
                        </div>

                        {/* Message for no data in monthly report */}
                        {monthlyFinancials.totalIncome === 0 && monthlyFinancials.totalExpenses === 0 && monthlyFinancials.totalSaves === 0 && (
                            <p className="text-center text-gray-500 py-8">No data available for {getMonthName(selectedMonthYear, selectedMonthIndex)}. Add some transactions!</p>
                        )}
                    </div>
                )}
            </main>

            {/* Custom Delete Confirmation Modal/Overlay */}
            {showConfirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                        <p className="text-gray-700 mb-6">Are you sure you want to delete "<span className="font-semibold">{deleteTitle}</span>"? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;