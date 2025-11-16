import "../css/SalaryPage.css";
import { BaitoContext } from "../context/BaitoContext";
import SalaryDisplay from "../components/SalaryDisplay";
import DailySalariesChart from "../components/DailySalariesChart";
import MonthlySalariesChart from "../components/MonthlySalariesChart";
import { useEffect, useState, useContext } from "react";
import {
  TextField,
  IconButton,
  Switch,
  Paper,
  Typography,
  InputAdornment,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

function SalaryPage() {
  const { fetchWorkdays, calculateDailySalary } = useContext(BaitoContext);

  const [savedDate, setSavedDate] = useState(new Date());
  const [workdays, setWorkdays] = useState([]);
  const [monthlySalaries, setMonthlySalaries] = useState(Array(12).fill(0));
  const [isMonthView, setIsMonthView] = useState(true);
  const [monthViewInputValue, setMonthViewInputValue] = useState(
    formatDate(savedDate)
  );
  const [yearViewInputValue, setYearViewInputValue] = useState(
    savedDate.getFullYear()
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWorkdays = async () => {
      // FIX: Pass the 0-indexed month directly. The context now handles the +1.
      const data = await fetchWorkdays(
        savedDate.getFullYear(),
        savedDate.getMonth()
      );
      setWorkdays(data);
    };
    loadWorkdays();
  }, [savedDate, fetchWorkdays]);

  useEffect(() => {
    const loadYearlySalaries = async () => {
      const allMonths = Array.from({ length: 12 }, (_, i) => i); // Use 0-11 for months
      const salaries = await Promise.all(
        allMonths.map(async (month) => {
          const monthWorkdays = await fetchWorkdays(yearViewInputValue, month);
          return calculateDailySalary(monthWorkdays).reduce(
            (sum, a) => sum + a,
            0
          );
        })
      );
      setMonthlySalaries(salaries);
    };

    if (!isMonthView) {
      loadYearlySalaries();
    }
  }, [yearViewInputValue, isMonthView, fetchWorkdays, calculateDailySalary]);

  // --- Calculations ---
  const dailySalaries = calculateDailySalary(workdays);
  const daysInMonth = new Date(
    savedDate.getFullYear(),
    savedDate.getMonth() + 1,
    0
  ).getDate();
  const dailySalariesArray = Array(daysInMonth).fill(0);
  workdays.forEach((workday) => {
    const index = workdays.findIndex((w) => w.day === workday.day);
    if (index !== -1) {
      dailySalariesArray[workday.day - 1] = dailySalaries[index];
    }
  });
  const monthlySalary = dailySalaries.reduce((tempSum, a) => tempSum + a, 0);
  const yearlySalary = monthlySalaries.reduce((tempSum, a) => tempSum + a, 0);

  // --- Helper Functions ---
  function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  const changeMonth = (delta) => {
    setSavedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
    );
    setError("");
  };

  const changeYear = (delta) => {
    setYearViewInputValue((prev) => prev + delta);
  };

  const handleToggle = (e) => {
    setIsMonthView(e.target.checked);
  };

  const handleMonthInputChange = (e) => {
    const value = e.target.value;
    setMonthViewInputValue(value);
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
      const [year, month] = value.split("-").map(Number);
      setSavedDate(new Date(year, month - 1, 1));
      setError("");
    }
  };

  const handleYearInputChange = (e) => {
    const value = e.target.value;
    if (/^\d{4}$/.test(value)) {
      setYearViewInputValue(parseInt(value));
    }
  };

  const handleBarClick = (event, { dataIndex }) => {
    setIsMonthView(true);
    setSavedDate(new Date(yearViewInputValue, dataIndex, 1));
  };

  const handleBlur = () => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(monthViewInputValue)) {
      setError("Please use YYYY-MM format");
      setMonthViewInputValue(formatDate(savedDate));
    }
  };

  useEffect(() => {
    setMonthViewInputValue(formatDate(savedDate));
  }, [savedDate]);

  return (
    <div id="salary-page">
      <Paper
        elevation={1}
        sx={{ display: "flex", alignItems: "center", gap: 2, padding: 2 }}
      >
        <Typography
          sx={{
            color: !isMonthView ? "black" : "gray",
            fontWeight: !isMonthView ? "bold" : "normal",
          }}
        >
          Year View
        </Typography>
        <Switch checked={isMonthView} onChange={handleToggle} color="primary" />
        <Typography
          sx={{
            color: isMonthView ? "black" : "gray",
            fontWeight: isMonthView ? "bold" : "normal",
          }}
        >
          Month View
        </Typography>
      </Paper>

      {isMonthView ? (
        <>
          <Paper
            elevation={3}
            sx={{
              paddingX: 2,
              paddingBottom: 0,
              paddingTop: 0.25,
              maxWidth: 300,
              height: 90,
              marginBottom: 0,
            }}
          >
            <TextField
              fullWidth
              label="YYYY-MM"
              value={monthViewInputValue}
              onChange={handleMonthInputChange}
              onBlur={handleBlur}
              error={!!error}
              helperText={error || " "}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => changeMonth(-1)} size="small">
                      <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={() => changeMonth(1)} size="small">
                      <ChevronRight />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
          <DailySalariesChart salaries={dailySalariesArray} />
          <SalaryDisplay salary={monthlySalary} />
        </>
      ) : (
        <>
          <Paper
            elevation={3}
            sx={{
              paddingX: 2,
              paddingBottom: 0,
              paddingTop: 0.25,
              maxWidth: 300,
              height: 90,
            }}
          >
            <TextField
              fullWidth
              label="YYYY"
              value={yearViewInputValue}
              onChange={handleYearInputChange}
              type="number"
              helperText={" "}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => changeYear(-1)} size="small">
                      <ChevronLeft />
                    </IconButton>
                    <IconButton onClick={() => changeYear(1)} size="small">
                      <ChevronRight />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Paper>
          <MonthlySalariesChart
            salaries={monthlySalaries}
            onItemClick={handleBarClick}
          />
          <SalaryDisplay salary={yearlySalary} />
        </>
      )}
    </div>
  );
}

export default SalaryPage;
