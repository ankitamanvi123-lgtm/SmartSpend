import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import "./Dashboard.css";

function Dashboard() {
  const token = localStorage.getItem("token");

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoal, setSavingsGoal] = useState(null);

  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDate());

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");

  const [budgetAmount, setBudgetAmount] = useState("");

  const [goalAmount, setGoalAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");

  // Emergency fund planner settings are saved in this browser.
  const [emergencyExpenses, setEmergencyExpenses] = useState(
    () => localStorage.getItem("emergencyExpenses") || ""
  );
  const [emergencyMonths, setEmergencyMonths] = useState(
    () => localStorage.getItem("emergencyMonths") || "3"
  );
  const [emergencySaved, setEmergencySaved] = useState(
    () => localStorage.getItem("emergencySaved") || ""
  );

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("");

  const currentMonth = getTodayDate().slice(0, 7);

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  useEffect(() => {
    loadTransactions();
    loadBudgets();
    loadSavingsGoal();
    loadUser();
  }, []);

  const loadUser = () => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        setUserName(user.name || "User");
        setUserEmail(user.email || "");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await axios.get(
        "https://smartspend-backend-xhjr.onrender.com/apitransactions",
        axiosConfig
      );

      setTransactions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadBudgets = async () => {
    try {
      const response = await axios.get(
        "https://smartspend-backend-xhjr.onrender.com/apibudgets",
        axiosConfig
      );

      setBudgets(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadSavingsGoal = async () => {
    try {
      const response = await axios.get(
        "https://smartspend-backend-xhjr.onrender.com/apisavings-goal",
        axiosConfig
      );

      setSavingsGoal(response.data);

      if (response.data) {
        setGoalAmount(response.data.goalAmount);
        setSavedAmount(response.data.savedAmount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/";
  };

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return "";

    if (typeof dateValue === "string") {
      const dateOnly = dateValue.split("T")[0];
      const parts = dateOnly.split("-");

      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const oldDate = new Date(dateValue);

    if (!isNaN(oldDate.getTime())) {
      const day = String(oldDate.getDate()).padStart(2, "0");
      const month = String(oldDate.getMonth() + 1).padStart(2, "0");
      const year = oldDate.getFullYear();

      return `${day}/${month}/${year}`;
    }

    return "";
  };

  const getDateForInput = (dateValue) => {
    if (!dateValue) return getTodayDate();

    if (typeof dateValue === "string") {
      return dateValue.split("T")[0];
    }

    const oldDate = new Date(dateValue);

    const year = oldDate.getFullYear();
    const month = String(oldDate.getMonth() + 1).padStart(2, "0");
    const day = String(oldDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const data = {
        type,
        amount: Number(amount),
        category,
        description,
        date
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/transactions/${editingId}`,
          data,
          axiosConfig
        );

        alert("Transaction updated successfully");
      } else {
        await axios.post(
          "http://localhost:5000/api/transactions",
          data,
          axiosConfig
        );

        alert("Transaction added successfully");
      }

      resetForm();
      loadTransactions();
    } catch (error) {
      console.log("Transaction Submit Error:", error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  const resetForm = () => {
    setType("income");
    setAmount("");
    setCategory("");
    setDescription("");
    setDate(getTodayDate());
    setEditingId(null);
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setType(transaction.type);
    setAmount(transaction.amount);
    setCategory(transaction.category);
    setDescription(transaction.description || "");
    setDate(getDateForInput(transaction.date));

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/transactions/${id}`,
        axiosConfig
      );

      alert("Transaction deleted successfully");

      loadTransactions();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete transaction"
      );
    }
  };

  const handleBudgetSave = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/budgets",
        {
          month: currentMonth,
          amount: Number(budgetAmount)
        },
        axiosConfig
      );

      alert("Budget saved successfully");

      setBudgetAmount("");

      loadBudgets();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save budget"
      );
    }
  };

  const handleSavingsGoalSave = async (event) => {
    event.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/savings-goal",
        {
          goalAmount: Number(goalAmount),
          savedAmount: Number(savedAmount)
        },
        axiosConfig
      );

      alert("Savings goal saved successfully");

      loadSavingsGoal();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to save savings goal"
      );
    }
  };

  const totalIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === "income"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const totalExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === "expense"
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount),
      0
    );

  const balance = totalIncome - totalExpense;

  const currentMonthTransactions =
    transactions.filter((transaction) => {
      let transactionMonth = "";

      if (typeof transaction.date === "string") {
        transactionMonth = transaction.date
          .split("T")[0]
          .slice(0, 7);
      } else {
        transactionMonth = getDateForInput(
          transaction.date
        ).slice(0, 7);
      }

      return transactionMonth === currentMonth;
    });

  const currentMonthIncome =
    currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const currentMonthExpenses =
    currentMonthTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total + Number(transaction.amount),
        0
      );

  const currentMonthBalance =
    currentMonthIncome -
    currentMonthExpenses;

  const currentBudget = budgets.find(
    (budget) =>
      budget.month === currentMonth
  );

  const monthlyBudget = currentBudget
    ? Number(currentBudget.amount)
    : 0;

  const remainingBudget =
    monthlyBudget -
    currentMonthExpenses;

  const budgetPercentage =
    monthlyBudget > 0
      ? (currentMonthExpenses / monthlyBudget) * 100
      : 0;

  let budgetWarning = "";
  let budgetWarningColor = "";
  let budgetWarningBackground = "";

  if (monthlyBudget > 0) {
    if (currentMonthExpenses >= monthlyBudget) {
      budgetWarning =
        "🚨 Budget exceeded! You have spent your monthly budget.";
      budgetWarningColor = "#dc2626";
      budgetWarningBackground = "#fef2f2";
    } else if (budgetPercentage >= 80) {
      budgetWarning =
        "⚠️ Your budget is almost reached. Consider reducing your expenses.";
      budgetWarningColor = "#d97706";
      budgetWarningBackground = "#fffbeb";
    } else {
      budgetWarning =
        "✓ You are within your monthly budget.";
      budgetWarningColor = "#16a34a";
      budgetWarningBackground = "#f0fdf4";
    }
  }

  const currentGoalAmount = savingsGoal
    ? Number(savingsGoal.goalAmount)
    : Number(goalAmount) || 0;

  const currentSavedAmount = savingsGoal
    ? Number(savingsGoal.savedAmount)
    : Number(savedAmount) || 0;

  const savingsRemaining = Math.max(
    currentGoalAmount - currentSavedAmount,
    0
  );

  const savingsPercentage =
    currentGoalAmount > 0
      ? Math.min(
          (currentSavedAmount /
            currentGoalAmount) *
            100,
          100
        )
      : 0;

  const filteredTransactions =
    transactions.filter((transaction) => {
      const searchText =
        search.toLowerCase();

      const categoryText =
        transaction.category?.toLowerCase() ||
        "";

      const descriptionText =
        transaction.description?.toLowerCase() ||
        "";

      const matchesSearch =
        categoryText.includes(searchText) ||
        descriptionText.includes(searchText);

      const matchesType =
        filterType === "all" ||
        transaction.type === filterType;

      return matchesSearch && matchesType;
    });

  const expenseCategoryData =
    useMemo(() => {
      const categoryTotals = {};

      transactions
        .filter(
          (transaction) =>
            transaction.type === "expense"
        )
        .forEach((transaction) => {
          const categoryName =
            transaction.category;

          categoryTotals[categoryName] =
            (categoryTotals[categoryName] || 0) +
            Number(transaction.amount);
        });

      return Object.entries(categoryTotals).map(
        ([name, value]) => ({
          name,
          value
        })
      );
    }, [transactions]);

  const monthlyChartData =
    useMemo(() => {
      const monthlyData = {};

      transactions.forEach((transaction) => {
        let month = "";

        if (typeof transaction.date === "string") {
          month = transaction.date
            .split("T")[0]
            .slice(0, 7);
        } else {
          month = getDateForInput(
            transaction.date
          ).slice(0, 7);
        }

        if (!monthlyData[month]) {
          monthlyData[month] = {
            month,
            income: 0,
            expense: 0
          };
        }

        if (transaction.type === "income") {
          monthlyData[month].income +=
            Number(transaction.amount);
        } else {
          monthlyData[month].expense +=
            Number(transaction.amount);
        }
      });

      return Object.values(monthlyData)
        .sort((a, b) =>
          a.month.localeCompare(b.month)
        )
        .slice(-6);
    }, [transactions]);

  // SmartSpend insights: compare the current month with the previous month.
  const previousMonth = useMemo(() => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }, [currentMonth]);

  const previousMonthExpenses = useMemo(() => {
    return transactions
      .filter((transaction) => {
        const transactionDate = String(transaction.date || "").split("T")[0];
        return transaction.type === "expense" && transactionDate.slice(0, 7) === previousMonth;
      })
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  }, [transactions, previousMonth]);

  const currentMonthExpenseByCategory = useMemo(() => {
    const totals = {};
    currentMonthTransactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const name = transaction.category || "Other";
        totals[name] = (totals[name] || 0) + Number(transaction.amount || 0);
      });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [currentMonthTransactions]);

  const highestSpendCategory = currentMonthExpenseByCategory[0];
  const daysLeftInMonth = Math.max(
    1,
    new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).getDate() - new Date().getDate() + 1
  );
  const safeToSpendToday = monthlyBudget > 0
    ? Math.max(0, remainingBudget) / daysLeftInMonth
    : null;
  const expenseChange = previousMonthExpenses > 0
    ? ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
    : null;
  const emergencyTarget = Math.max(0, Number(emergencyExpenses) || 0) * Math.max(1, Number(emergencyMonths) || 1);
  const emergencySavedNumber = Math.max(0, Number(emergencySaved) || 0);
  const emergencyProgress = emergencyTarget > 0
    ? Math.min(100, (emergencySavedNumber / emergencyTarget) * 100)
    : 0;

  const saveEmergencySettings = () => {
    localStorage.setItem("emergencyExpenses", emergencyExpenses);
    localStorage.setItem("emergencyMonths", emergencyMonths);
    localStorage.setItem("emergencySaved", emergencySaved);
  };

  const exportTransactionsCSV = () => {
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows = transactions.map((transaction) => [
      transaction.date || "",
      transaction.type || "",
      transaction.category || "",
      transaction.description || "",
      transaction.amount ?? 0
    ]);
    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smartspend-transactions.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard">

      {/* HEADER */}

      
<div className="dashboard-header">
  <div>
    <h1>Welcome, {userName} 👋</h1>
    <p>Manage your personal finances</p>
  </div>

  <div className="dashboard-header-actions">
    <button
      className="money-school-button"
      onClick={() => {
        window.location.href = "/money-school";
      }}
    >
      📚 Money School
    </button>

    <button
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</div>

      {/* PROFILE */}

      <div className="profile-box">

        <div className="profile-avatar">
          {userName.charAt(0).toUpperCase()}
        </div>

        <div className="profile-info">
          <h2>My Profile</h2>

          <div className="profile-details">

            <div>
              <span className="profile-label">
                Name
              </span>

              <strong>
                {userName}
              </strong>
            </div>

            <div>
              <span className="profile-label">
                Email
              </span>

              <strong>
                {userEmail || "Not available"}
              </strong>
            </div>

            <div>
              <span className="profile-label">
                Account
              </span>

              <strong>
                Personal Budget Account
              </strong>
            </div>

          </div>
        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="summary-cards">

        <div className="summary-card">
          <p>Total Balance</p>

          <h2>
            ₹{balance.toLocaleString("en-IN")}
          </h2>

          <span>
            Income - Expenses
          </span>
        </div>

        <div className="summary-card">
          <p>Total Income</p>

          <h2 className="income-text">
            ₹{totalIncome.toLocaleString("en-IN")}
          </h2>

          <span>
            All income
          </span>
        </div>

        <div className="summary-card">
          <p>Total Expenses</p>

          <h2 className="expense-text">
            ₹{totalExpense.toLocaleString("en-IN")}
          </h2>

          <span>
            All expenses
          </span>
        </div>

        <div className="summary-card">
          <p>Monthly Budget</p>

          <h2>
            ₹{monthlyBudget.toLocaleString("en-IN")}
          </h2>

          <span>
            Current month
          </span>
        </div>

      </div>

      {/* CURRENT MONTH FINANCIAL SUMMARY */}

      <div className="dashboard-box">

        <h2>
          Current Month Financial Summary
        </h2>

        <div className="summary-cards monthly-summary-cards">

          <div className="summary-card">
            <p>
              This Month's Income
            </p>

            <h2 className="income-text">
              ₹{currentMonthIncome.toLocaleString("en-IN")}
            </h2>

            <span>
              Income received this month
            </span>
          </div>

          <div className="summary-card">
            <p>
              This Month's Expenses
            </p>

            <h2 className="expense-text">
              ₹{currentMonthExpenses.toLocaleString("en-IN")}
            </h2>

            <span>
              Money spent this month
            </span>
          </div>

          <div className="summary-card">
            <p>
              This Month's Balance
            </p>

            <h2
              className={
                currentMonthBalance >= 0
                  ? "income-text"
                  : "expense-text"
              }
            >
              ₹{currentMonthBalance.toLocaleString("en-IN")}
            </h2>

            <span>
              Income - Expenses
            </span>
          </div>

          <div className="summary-card">
            <p>
              Current Month
            </p>

            <h2>
              {new Date(
                `${currentMonth}-01`
              ).toLocaleString(
                "en-IN",
                {
                  month: "short",
                  year: "numeric"
                }
              )}
            </h2>

            <span>
              Financial overview
            </span>
          </div>

        </div>

      </div>

      {/* SAVINGS GOAL */}

      <div className="dashboard-box">

        <h2>
          Savings Goal 🎯
        </h2>

        <form
          onSubmit={
            handleSavingsGoalSave
          }
        >

          <div className="form-row">

            <div className="input-group">

              <label>
                Savings Goal
              </label>

              <input
                type="number"
                placeholder="Enter goal amount"
                value={goalAmount}
                onChange={(event) =>
                  setGoalAmount(
                    event.target.value
                  )
                }
                min="0"
                required
              />

            </div>

            <div className="input-group">

              <label>
                Amount Saved
              </label>

              <input
                type="number"
                placeholder="Enter amount saved"
                value={savedAmount}
                onChange={(event) =>
                  setSavedAmount(
                    event.target.value
                  )
                }
                min="0"
                required
              />

            </div>

          </div>

          <button
            className="add-button"
            type="submit"
          >
            Save Savings Goal
          </button>

        </form>

        {currentGoalAmount > 0 && (
          <div
            className="budget-progress-section"
            style={{
              marginTop: "25px"
            }}
          >

            <div className="budget-progress-header">

              <span>
                ₹{currentSavedAmount.toLocaleString("en-IN")} saved
              </span>

              <strong>
                {Math.round(
                  savingsPercentage
                )}
                %
              </strong>

            </div>

            <div className="budget-progress-bar">

              <div
                className="budget-progress-fill"
                style={{
                  width: `${savingsPercentage}%`
                }}
              />

            </div>

            <p
              style={{
                marginTop: "10px",
                color:
                  savingsRemaining === 0
                    ? "#16a34a"
                    : "#667085",
                fontSize: "14px"
              }}
            >
              {savingsRemaining === 0
                ? "🎉 Savings goal reached!"
                : `₹${savingsRemaining.toLocaleString(
                    "en-IN"
                  )} remaining to reach your goal`}
            </p>

          </div>
        )}

      </div>

      {/* ADD / EDIT TRANSACTION */}

      <div className="dashboard-box transaction-form-box">

        <h2>
          {editingId
            ? "Edit Transaction"
            : "Add Transaction"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="form-row">

            <div className="input-group">

              <label>
                Type
              </label>

              <select
                value={type}
                onChange={(event) => {
                  setType(event.target.value);
                  setCategory("");
                }}
              >

                <option value="income">
                  Income
                </option>

                <option value="expense">
                  Expense
                </option>

              </select>

            </div>

            <div className="input-group">

              <label>
                Amount
              </label>

              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                min="0"
                required
              />

            </div>

          </div>

          <div className="form-row">

            <div className="input-group">

              <label>
                Category
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                required
              >

                <option value="">
                  Select Category
                </option>

                {type === "income" ? (
                  <>
                    <option value="Salary">
                      Salary
                    </option>

                    <option value="Freelance">
                      Freelance
                    </option>

                    <option value="Business">
                      Business
                    </option>

                    <option value="Investment">
                      Investment
                    </option>

                    <option value="Gift">
                      Gift
                    </option>

                    <option value="Other Income">
                      Other Income
                    </option>
                  </>
                ) : (
                  <>
                    <option value="Food">
                      Food
                    </option>

                    <option value="Travel">
                      Travel
                    </option>

                    <option value="Shopping">
                      Shopping
                    </option>

                    <option value="Bills">
                      Bills
                    </option>

                    <option value="Education">
                      Education
                    </option>

                    <option value="Entertainment">
                      Entertainment
                    </option>

                    <option value="Health">
                      Health
                    </option>

                    <option value="Rent">
                      Rent
                    </option>

                    <option value="Other Expense">
                      Other Expense
                    </option>
                  </>
                )}

              </select>

            </div>

            <div className="input-group">

              <label>
                Transaction Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                required
              />

            </div>

          </div>

          <div className="input-group">

            <label>
              Description
            </label>

            <input
              type="text"
              placeholder="Optional description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

          </div>

          <button
            className="add-button"
            type="submit"
          >
            {editingId
              ? "Update Transaction"
              : "Add Transaction"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-edit-button"
              onClick={resetForm}
            >
              Cancel
            </button>
          )}

        </form>

      </div>

      {/* MONTHLY BUDGET */}

      <div className="dashboard-box">

        <h2>
          Monthly Budget
        </h2>

        <form onSubmit={handleBudgetSave}>

          <div className="form-row">

            <div className="input-group">

              <label>
                Budget for this month
              </label>

              <input
                type="number"
                placeholder="Enter monthly budget"
                value={budgetAmount}
                onChange={(event) =>
                  setBudgetAmount(
                    event.target.value
                  )
                }
                min="0"
                required
              />

            </div>

            <div
              className="input-group"
              style={{
                display: "flex",
                alignItems: "flex-end"
              }}
            >

              <button
                className="add-button"
                type="submit"
              >
                Save Budget
              </button>

            </div>

          </div>

        </form>

        <div className="budget-progress-section">

          <div className="budget-progress-header">

            <span>
              ₹{currentMonthExpenses.toLocaleString("en-IN")} spent
            </span>

            <strong>
              {Math.round(
                Math.min(
                  budgetPercentage,
                  100
                )
              )}
              %
            </strong>

          </div>

          <div className="budget-progress-bar">

            <div
              className="budget-progress-fill"
              style={{
                width: `${Math.min(
                  budgetPercentage,
                  100
                )}%`
              }}
            />

          </div>

          <p
            style={{
              marginTop: "10px",
              color:
                remainingBudget >= 0
                  ? "#16a34a"
                  : "#dc2626",
              fontSize: "14px"
            }}
          >
            {remainingBudget >= 0
              ? `₹${remainingBudget.toLocaleString(
                  "en-IN"
                )} remaining`
              : `₹${Math.abs(
                  remainingBudget
                ).toLocaleString(
                  "en-IN"
                )} over budget`}
          </p>

          {monthlyBudget > 0 && (
            <div
              style={{
                marginTop: "16px",
                padding: "13px 15px",
                borderRadius: "9px",
                background:
                  budgetWarningBackground,
                color:
                  budgetWarningColor,
                fontSize: "14px",
                fontWeight: "600",
                border: `1px solid ${budgetWarningColor}`
              }}
            >
              {budgetWarning}
            </div>
          )}

        </div>

      </div>

      {/* SMARTSPEND: DAILY SPENDING GUIDANCE */}
      <div className="dashboard-box">
        <h2>SmartSpend Daily Guide ✨</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "20px", borderRadius: "12px", background: "#eff6ff", border: "1px solid #dbeafe" }}>
            <p style={{ color: "#1d4ed8", fontWeight: 600, marginBottom: "8px" }}>Suggested safe-to-spend today</p>
            <h2 style={{ marginBottom: "8px", color: "#1d4ed8" }}>
              {safeToSpendToday === null ? "Set a monthly budget" : `₹${Math.floor(safeToSpendToday).toLocaleString("en-IN")}`}
            </h2>
            <p style={{ color: "#475569", fontSize: "13px" }}>
              {safeToSpendToday === null
                ? "Add a monthly budget to calculate a daily guide."
                : `Based on ₹${Math.max(0, remainingBudget).toLocaleString("en-IN")} remaining across ${daysLeftInMonth} day(s), including today.`}
            </p>
          </div>
          <div style={{ padding: "20px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
            <p style={{ color: "#15803d", fontWeight: 600, marginBottom: "8px" }}>Monthly spending comparison</p>
            <h2 style={{ marginBottom: "8px", color: "#15803d" }}>
              {previousMonthExpenses === 0
                ? "No previous data"
                : `${Math.abs(expenseChange).toFixed(1)}% ${expenseChange > 0 ? "higher" : expenseChange < 0 ? "lower" : "unchanged"}`}
            </h2>
            <p style={{ color: "#475569", fontSize: "13px" }}>
              This month: ₹{currentMonthExpenses.toLocaleString("en-IN")} · Previous month: ₹{previousMonthExpenses.toLocaleString("en-IN")}
            </p>
          </div>
          <div style={{ padding: "20px", borderRadius: "12px", background: "#fff7ed", border: "1px solid #fed7aa" }}>
            <p style={{ color: "#c2410c", fontWeight: 600, marginBottom: "8px" }}>Top spending category</p>
            <h2 style={{ marginBottom: "8px", color: "#c2410c" }}>{highestSpendCategory ? highestSpendCategory[0] : "No expenses yet"}</h2>
            <p style={{ color: "#475569", fontSize: "13px" }}>
              {highestSpendCategory
                ? `₹${highestSpendCategory[1].toLocaleString("en-IN")} spent in this category this month.`
                : "Add an expense to see your highest-spending category."}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "18px", padding: "15px", borderRadius: "10px", background: budgetWarningBackground || "#f8fafc", color: budgetWarningColor || "#475569", border: `1px solid ${budgetWarningColor || "#e2e8f0"}` }}>
          <strong>Smart insight: </strong>
          {monthlyBudget <= 0
            ? "Set a monthly budget to receive budget guidance."
            : remainingBudget < 0
              ? `You are ₹${Math.abs(remainingBudget).toLocaleString("en-IN")} over budget. Review non-essential spending.`
              : budgetPercentage >= 80
                ? `You have used ${Math.round(budgetPercentage)}% of your budget. Consider pausing non-essential purchases.`
                : highestSpendCategory
                  ? `${highestSpendCategory[0]} is your highest expense category this month. Review it if you want to save more.`
                  : "You are within your budget. Add expenses to receive more personalized spending insights."}
        </div>
      </div>

      {/* EMERGENCY FUND PLANNER */}
     
      {/* SPENDING INSIGHTS */}
      <div className="dashboard-box spending-insights">
        <h2>Spending Insights 📊</h2>
        <p className="insights-intro">
          Understand your spending habits and make smarter financial decisions.
        </p>

        <div className="insights-grid">
          <div className="insight-card">
            <span className="insight-icon">💰</span>
            <p>Safe to Spend Today</p>
            <h3>
              {safeToSpendToday === null
                ? "Set a budget"
                : `₹${Math.floor(safeToSpendToday).toLocaleString("en-IN")}`}
            </h3>
            <span>
              {safeToSpendToday === null
                ? "Add a monthly budget to calculate your daily guide."
                : `Based on ${daysLeftInMonth} day(s) remaining, including today.`}
            </span>
          </div>

          <div className="insight-card">
            <span className="insight-icon">📈</span>
            <p>Monthly Expense Trend</p>
            <h3>
              {previousMonthExpenses === 0
                ? "No comparison yet"
                : `${Math.abs(expenseChange).toFixed(1)}% ${
                    expenseChange > 0
                      ? "higher"
                      : expenseChange < 0
                      ? "lower"
                      : "unchanged"
                  }`}
            </h3>
            <span>
              This month: ₹{currentMonthExpenses.toLocaleString("en-IN")}
              {" · "}
              Previous month: ₹{previousMonthExpenses.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="insight-card">
            <span className="insight-icon">🛍️</span>
            <p>Top Spending Category</p>
            <h3>
              {highestSpendCategory
                ? highestSpendCategory[0]
                : "No expenses yet"}
            </h3>
            <span>
              {highestSpendCategory
                ? `₹${highestSpendCategory[1].toLocaleString("en-IN")} spent this month.`
                : "Add an expense to discover your biggest category."}
            </span>
          </div>

          <div className="insight-card">
            <span className="insight-icon">🎯</span>
            <p>Budget Remaining</p>
            <h3 className={remainingBudget < 0 ? "expense-text" : "income-text"}>
              {monthlyBudget <= 0
                ? "No budget set"
                : `₹${Math.abs(remainingBudget).toLocaleString("en-IN")}`}
            </h3>
            <span>
              {monthlyBudget <= 0
                ? "Set a monthly budget to track your limit."
                : remainingBudget < 0
                ? "Amount spent above your budget."
                : "Amount available in your monthly budget."}
            </span>
          </div>
        </div>

        <div className="insight-message">
          <strong>💡 Smart suggestion</strong>
          <p>
            {monthlyBudget <= 0
              ? "Start by setting a realistic monthly budget."
              : remainingBudget < 0
              ? "Your expenses have exceeded your budget. Review non-essential purchases and adjust your spending plan."
              : budgetPercentage >= 80
              ? "You have used at least 80% of your budget. Be careful with non-essential spending for the rest of the month."
              : highestSpendCategory
              ? `Your highest spending category is ${highestSpendCategory[0]}. Review these purchases to find opportunities to save.`
              : "You are within your budget. Keep recording transactions to receive more personalized insights."}
          </p>
        </div>
      </div>

      {/* SMARTSPEND: DAILY SPENDING GUIDANCE */}
      <div className="dashboard-box">
        <h2>Daily Spending Guide ✨</h2>
        <p className="insights-intro">
          Use your remaining monthly budget to plan your daily spending.
        </p>
        <div className="insights-grid">
          <div className="insight-card">
            <p>Daily Spending Allowance</p>
            <h3>
              {safeToSpendToday === null
                ? "Set a budget"
                : `₹${Math.floor(safeToSpendToday).toLocaleString("en-IN")}`}
            </h3>
            <span>
              {safeToSpendToday === null
                ? "Your daily guide appears after you set a monthly budget."
                : `Calculated from ₹${Math.max(0, remainingBudget).toLocaleString("en-IN")} remaining.`}
            </span>
          </div>
          <div className="insight-card">
            <p>Days Left This Month</p>
            <h3>{daysLeftInMonth}</h3>
            <span>Including today.</span>
          </div>
        </div>
      </div>


      {/* EXPORTABLE TRANSACTION REPORT */}
      <div className="dashboard-box" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ marginBottom: "6px" }}>Download Financial Data</h2>
          <p style={{ color: "#667085", fontSize: "14px" }}>Export your transaction history as a CSV file that opens in Excel or Google Sheets.</p>
        </div>
        <button className="add-button" type="button" onClick={exportTransactionsCSV}>Download CSV Report</button>
      </div>

      {/* TRANSACTIONS */}

      <div className="dashboard-box">

        <h2>
          Recent Transactions
        </h2>

        <div className="transaction-controls">

          <input
            className="search-input"
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <select
            className="filter-select"
            value={filterType}
            onChange={(event) =>
              setFilterType(event.target.value)
            }
          >

            <option value="all">
              All Transactions
            </option>

            <option value="income">
              Income
            </option>

            <option value="expense">
              Expenses
            </option>

          </select>

        </div>

        {filteredTransactions.length === 0 ? (
          <p className="empty-message">
            No transactions found.
          </p>
        ) : (
          <div className="transaction-list">

            {filteredTransactions.map(
              (transaction) => (

                <div
                  className="transaction-item"
                  key={transaction._id}
                >

                  <div className="transaction-info">

                    <strong>
                      {transaction.category}
                    </strong>

                    <span>
                      {transaction.description ||
                        "No description"}
                    </span>

                    <span className="transaction-date">
                      {formatDisplayDate(
                        transaction.date
                      )}
                    </span>

                  </div>

                  <div className="transaction-right">

                    <strong
                      className={
                        transaction.type === "income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >
                      {transaction.type === "income"
                        ? "+"
                        : "-"}
                      ₹
                      {Number(
                        transaction.amount
                      ).toLocaleString("en-IN")}
                    </strong>

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(transaction)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(transaction._id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>
        )}

      </div>

      {/* EXPENSE PIE CHART */}

      <div className="dashboard-box chart-box">

        <h2>
          Expense by Category
        </h2>

        {expenseCategoryData.length === 0 ? (
          <p className="empty-message">
            Add expense transactions to see the chart.
          </p>
        ) : (
          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <PieChart>

                <Pie
                  data={expenseCategoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {expenseCategoryData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                      />
                    )
                  )}

                </Pie>

                <Tooltip />
                <Legend />

              </PieChart>

            </ResponsiveContainer>

          </div>
        )}

      </div>

      {/* MONTHLY BAR CHART */}

      <div className="dashboard-box chart-box">

        <h2>
          Monthly Income vs Expense
        </h2>

        {monthlyChartData.length === 0 ? (
          <p className="empty-message">
            Add transactions to see the monthly chart.
          </p>
        ) : (
          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={monthlyChartData}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Bar
                  dataKey="income"
                  name="Income"
                />

                <Bar
                  dataKey="expense"
                  name="Expense"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;