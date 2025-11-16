import Calendar from "react-calendar";
import "../css/Calendar.css";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useContext,
} from "react";
import {
  Switch,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
  Paper,
  InputAdornment,
} from "@mui/material";
import { BaitoContext } from "../context/BaitoContext.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import "../css/ManageWorkdayPage.css";

function ManageWorkdayPage() {
  const {
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    WORKTIME_START,
    WORKTIME_END,
    PAY_INTERVAL_MINUTES,
    WEEKDAY_WAGE,
    WEEKEND_WAGE,
    addWorkday,
    updateWorkday,
    deleteWorkday,
    fetchWorkdays,
  } = useContext(BaitoContext);

  const [savedDate, setSavedDate] = useState(new Date());
  const [workdays, setWorkdays] = useState([]);

  const [currentWage, setCurrentWage] = useState(
    savedDate.getDay() == 0 || savedDate.getDay() == 6
      ? WEEKEND_WAGE
      : WEEKDAY_WAGE
  );

  const [isAddMode, setIsAddMode] = useState(true); // true -> Add , false -> Remove

  const [startTime, setStartTime] = useState({
    hour: DEFAULT_START_TIME.hour,
    minute: DEFAULT_START_TIME.minute,
  });
  const [endTime, setEndTime] = useState({
    hour: DEFAULT_END_TIME.hour,
    minute: DEFAULT_END_TIME.minute,
  });

  const startHourRef = useRef(null);
  const startMinuteRef = useRef(null);
  const endHourRef = useRef(null);
  const endMinuteRef = useRef(null);

  const body = document.body;
  const bodyRef = useRef(body);
  bodyRef.current.setAttribute("tabindex", "-1");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const hourOptions = Array.from(
    { length: WORKTIME_END.hour - WORKTIME_START.hour + 1 },
    (_, i) => WORKTIME_START.hour + i
  );
  const minuteOptions = Array.from(
    { length: 60 / PAY_INTERVAL_MINUTES },
    (_, i) => i * PAY_INTERVAL_MINUTES
  );

  const [keyBuffer, setKeyBuffer] = useState("");
  const lastKeyTimeRef = useRef(0);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key >= "0" && e.key <= "9") {
        const now = Date.now();
        const timeSinceLast = now - lastKeyTimeRef.current;
        lastKeyTimeRef.current = now;
        let newBuffer = "";

        if (timeSinceLast > 1000) {
          newBuffer = e.key;
        } else {
          newBuffer = `${keyBuffer}${e.key}`.slice(-2);
        }

        setKeyBuffer(newBuffer);
        const day = parseInt(newBuffer);
        if (day >= 1 && day <= 31) {
          setSavedDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth(), day)
          );
          console.log("Keyboard Shortcut: Changed day to", day);
          console.log(workdays);
        }
      } else if (e.key == " ") {
        if (isAddMode) setIsAddMode(false);
        else setIsAddMode(true);
      } else if (e.key === "Enter") {
        console.log(isModalOpen);
        if (isModalOpen) handleConfirm();
        else setIsModalOpen(true);
      } else if (e.key === "ArrowRight") {
        setSavedDate((prev) => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() + 1);
          return newDate;
        });
      } else if (e.key === "ArrowLeft") {
        setSavedDate((prev) => {
          const newDate = new Date(prev);
          newDate.setMonth(newDate.getMonth() - 1);
          return newDate;
        });
      } else if (e.key === "Tab") {
        e.preventDefault();
        const focusedElement = document.activeElement;
        switch (focusedElement.id) {
          case "StartHour":
            startMinuteRef.current?.focus();
            break;
          case "StartMinute":
            endHourRef.current?.focus();
            break;
          case "EndHour":
            endMinuteRef.current?.focus();
            break;
          case "EndMinute":
            startHourRef.current?.focus();
            break;
          default:
            startHourRef.current?.focus();
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyBuffer, isAddMode, savedDate, currentWage]
  );

  useEffect(() => {
    const loadWorkdays = async () => {
      const workdaysForMonth = await fetchWorkdays(
        savedDate.getFullYear(),
        savedDate.getMonth()
      );
      setWorkdays(workdaysForMonth);

      const workday = workdaysForMonth.find(
        (w) => w.day === savedDate.getDate()
      );
      if (workday) {
        setStartTime(workday.startTime);
        setEndTime(workday.endTime);
        setCurrentWage(workday.wage);
      } else {
        setStartTime(DEFAULT_START_TIME);
        setEndTime(DEFAULT_END_TIME);
        setCurrentWage(
          savedDate.getDay() === 0 || savedDate.getDay() === 6
            ? WEEKEND_WAGE
            : WEEKDAY_WAGE
        );
      }
    };
    loadWorkdays();
  }, [
    savedDate,
    fetchWorkdays,
    WEEKDAY_WAGE,
    WEEKEND_WAGE,
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  const handleDayClick = (date) => {
    setSavedDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth(), date.getDate())
    );
  };

  const handleTimeChange = (timeType, field) => (e) => {
    e.preventDefault();
    const value = parseInt(e.target.value);

    if (timeType === "start") {
      setStartTime((prev) => ({ ...prev, [field]: value }));
    } else {
      setEndTime((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleToggle = (event) => {
    setIsAddMode(event.target.checked);
  };

  const handleWageChange = (event) => {
    setCurrentWage(event.target.value);
  };

  const handleShowConfirmation = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    console.log("Confirmation cancelled.");
  };

  const handleConfirm = (e) => {
    e?.preventDefault?.();
    const selectedDay = savedDate.getDate();
    if (isAddMode) {
      if (!workdays.some((savedWorkday) => savedWorkday.day === selectedDay)) {
        const workday = {
          day: selectedDay,
          startTime: startTime,
          endTime: endTime,
          wage: currentWage,
        };
        addWorkday(savedDate.getFullYear(), savedDate.getMonth(), workday);
        console.log("Workday Added:", workday);
      } else {
        const workday = {
          day: selectedDay,
          startTime: startTime,
          endTime: endTime,
          wage: currentWage,
        };
        updateWorkday(
          savedDate.getFullYear(),
          savedDate.getMonth(),
          selectedDay,
          workday
        );
        console.log("Updated Workday:", workday);
      }
    } else {
      if (workdays.some((savedWorkday) => savedWorkday.day === selectedDay)) {
        deleteWorkday(
          savedDate.getFullYear(),
          savedDate.getMonth(),
          selectedDay
        );
        console.log("Deleted Workday:", selectedDay);
      }
    }
    setIsModalOpen(false);
  };

  return (
    <div className="page" id="workday-page">
      <div className="mode-switch">
        <Paper
          elevation={1}
          sx={{ display: "flex", alignItems: "center", gap: 0, padding: 1.5 }}
        >
          <Typography
            sx={{
              color: !isAddMode ? "black" : "gray",
              fontWeight: !isAddMode ? "bold" : "normal",
              width: 50,
              textAlign: "center",
            }}
          >
            Remove
          </Typography>

          <Switch checked={isAddMode} onChange={handleToggle} color="primary" />

          <Typography
            sx={{
              color: isAddMode ? "black" : "gray",
              fontWeight: isAddMode ? "bold" : "normal",
              width: 50,
              textAlign: "center",
            }}
          >
            Add
          </Typography>
        </Paper>
      </div>

      <div className="calendar-container">
        <Calendar
          className={"react-calendar"}
          value={savedDate}
          onClickDay={handleDayClick}
          onActiveStartDateChange={({ activeStartDate }) => {
            setSavedDate(
              new Date(
                activeStartDate.getFullYear(),
                activeStartDate.getMonth()
              )
            );

            bodyRef.current.focus();
          }}
          view="month"
          showNeighboringMonth={false}
          tileClassName={({ date }) =>
            workdays.some((workday) => workday.day === date.getDate())
              ? "workday"
              : ""
          }
        />
      </div>

      <div className="option-container">
        {isAddMode ? (
          <>
            <div className="select-time">
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  marginY: 3,
                  width: 225,
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: !isAddMode ? "text.primary" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  Start Time
                </Typography>
                <TextField
                  select
                  value={startTime.hour}
                  onChange={handleTimeChange("start", "hour")}
                  label="Hours"
                  size="small"
                  fullWidth
                  inputRef={startHourRef}
                  id="StartHour"
                >
                  {hourOptions.map((hour) => (
                    <MenuItem key={`start-h-${hour}`} value={hour}>
                      {String(hour).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  value={startTime.minute}
                  onChange={handleTimeChange("start", "minute")}
                  label="Minutes"
                  size="small"
                  type="number"
                  fullWidth
                  inputRef={startMinuteRef}
                  id="StartMinute"
                >
                  {minuteOptions.map((minute) => (
                    <MenuItem key={`start-h-${minute}`} value={minute}>
                      {String(minute).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  marginTop: 3,
                  width: 225,
                  alignItems: "center",
                }}
              >
                <Typography
                  sx={{
                    color: !isAddMode ? "text.primary" : "text.secondary",
                    whiteSpace: "nowrap",
                  }}
                >
                  End Time
                </Typography>
                <TextField
                  select
                  value={endTime.hour}
                  onChange={handleTimeChange("end", "hour")}
                  label="Hours"
                  size="small"
                  fullWidth
                  sx={{ marginLeft: 0.75 }}
                  inputRef={endHourRef}
                  id="EndHour"
                >
                  {hourOptions.map((hour) => (
                    <MenuItem key={`end-h-${hour}`} value={hour}>
                      {String(hour).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  value={endTime.minute}
                  onChange={handleTimeChange("end", "minute")}
                  label="Minutes"
                  size="small"
                  fullWidth
                  inputRef={endMinuteRef}
                  id="EndMinute"
                >
                  {minuteOptions.map((minute) => (
                    <MenuItem key={`end-h-${minute}`} value={minute}>
                      {String(minute).padStart(2, "0")}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </div>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                marginTop: 3,
                width: 125,
                alignItems: "center",
              }}
            >
              <Typography sx={{ color: "black", whiteSpace: "nowrap" }}>
                Wage
              </Typography>
              <TextField
                value={currentWage}
                onChange={handleWageChange}
                size="small"
                type="number"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">¥</InputAdornment>
                    ),
                  },
                }}
                fullWidth
                id="EndHour"
              ></TextField>
            </Box>
          </>
        ) : null}
      </div>

      <Button
        variant="contained"
        onClick={handleShowConfirmation}
        sx={{ marginY: 3, height: 40 }}
      >
        Confirm
      </Button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={`Confirm ${isAddMode ? "Addition" : "Deletion"}`}
        confirmText="Confirm"
        cancelText="Cancel"
        message={
          isAddMode
            ? `${savedDate.getMonth()}/${savedDate.getDate()} ${String(
                startTime.hour
              ).padStart(2, "0")}:${String(startTime.minute).padStart(
                2,
                "0"
              )} - ${String(endTime.hour).padStart(2, "0")}:${String(
                endTime.minute
              ).padStart(2, "0")}`
            : `${savedDate.getMonth()}/${savedDate.getDate()}`
        }
      />
    </div>
  );
}

export default ManageWorkdayPage;
