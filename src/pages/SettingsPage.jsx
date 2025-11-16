import { useContext, useState, useEffect } from "react";
import { BaitoContext } from "../context/BaitoContext";
import "../css/SettingsPage.css";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  TextField,
  CircularProgress,
} from "@mui/material";

function SettingsPage() {
  const {
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    WORKTIME_START,
    WORKTIME_END,
    COMMUTING_COST,
    PAY_INTERVAL_MINUTES,
    WEEKDAY_WAGE,
    WEEKEND_WAGE,
    setDefaultStartTime,
    setDefaultEndTime,
    setWorktimeStart,
    setWorktimeEnd,
    setCommutingCost,
    setPayIntervalMinutes,
    setWeekdayWage,
    setWeekendWage,
    saveSettings,
    isLoading,
  } = useContext(BaitoContext);

  // Local state for form inputs, initialized with default values
  const [tempDefaultStartTime, setTempDefaultStartTime] = useState({
    hour: 0,
    minute: 0,
  });
  const [tempDefaultEndTime, setTempDefaultEndTime] = useState({
    hour: 0,
    minute: 0,
  });
  const [tempWorktimeStart, setTempWorktimeStart] = useState({
    hour: 0,
    minute: 0,
  });
  const [tempWorktimeEnd, setTempWorktimeEnd] = useState({
    hour: 0,
    minute: 0,
  });
  const [tempWeekdayWage, setTempWeekdayWage] = useState(0);
  const [tempWeekendWage, setTempWeekendWage] = useState(0);
  const [tempCommutingCost, setTempCommutingCost] = useState(0);
  const [tempPayIntervalMinutes, setTempPayIntervalMinutes] = useState(15);

  // Effect to sync local form state with the context state once data is loaded
  useEffect(() => {
    if (!isLoading) {
      setTempDefaultStartTime(DEFAULT_START_TIME);
      setTempDefaultEndTime(DEFAULT_END_TIME);
      setTempWorktimeStart(WORKTIME_START);
      setTempWorktimeEnd(WORKTIME_END);
      setTempWeekdayWage(WEEKDAY_WAGE);
      setTempWeekendWage(WEEKEND_WAGE);
      setTempCommutingCost(COMMUTING_COST);
      setTempPayIntervalMinutes(PAY_INTERVAL_MINUTES);
    }
  }, [
    isLoading,
    DEFAULT_START_TIME,
    DEFAULT_END_TIME,
    WORKTIME_START,
    WORKTIME_END,
    WEEKDAY_WAGE,
    WEEKEND_WAGE,
    COMMUTING_COST,
    PAY_INTERVAL_MINUTES,
  ]);

  const handleChange = (e, field) => {
    const newValue = parseInt(e.target.value, 10);

    switch (field) {
      case "DefaultStartHour":
        setTempDefaultStartTime((prev) => ({ ...prev, hour: newValue }));
        break;
      case "DefaultStartMinute":
        setTempDefaultStartTime((prev) => ({ ...prev, minute: newValue }));
        break;
      case "DefaultEndHour":
        setTempDefaultEndTime((prev) => ({ ...prev, hour: newValue }));
        break;
      case "DefaultEndMinute":
        setTempDefaultEndTime((prev) => ({ ...prev, minute: newValue }));
        break;
      case "EarliestStartHour":
        setTempWorktimeStart((prev) => ({ ...prev, hour: newValue }));
        break;
      case "EarliestStartMinute":
        setTempWorktimeStart((prev) => ({ ...prev, minute: newValue }));
        break;
      case "LatestEndHour":
        setTempWorktimeEnd((prev) => ({ ...prev, hour: newValue }));
        break;
      case "LatestEndMinute":
        setTempWorktimeEnd((prev) => ({ ...prev, minute: newValue }));
        break;
      case "WeekdayWage":
        setTempWeekdayWage(newValue);
        break;
      case "WeekendWage":
        setTempWeekendWage(newValue);
        break;
      case "CommutingCost":
        setTempCommutingCost(newValue);
        break;
      case "PayIntervalMinutes":
        setTempPayIntervalMinutes(newValue);
        break;
      default:
        break;
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Update the context state for immediate UI feedback
    setDefaultStartTime(tempDefaultStartTime);
    setDefaultEndTime(tempDefaultEndTime);
    setWorktimeStart(tempWorktimeStart);
    setWorktimeEnd(tempWorktimeEnd);
    setWeekdayWage(tempWeekdayWage);
    setWeekendWage(tempWeekendWage);
    setCommutingCost(tempCommutingCost);
    setPayIntervalMinutes(tempPayIntervalMinutes);

    // Prepare the settings object to be saved
    const settingsToSave = {
      DEFAULT_START_TIME: tempDefaultStartTime,
      DEFAULT_END_TIME: tempDefaultEndTime,
      WORKTIME_START: tempWorktimeStart,
      WORKTIME_END: tempWorktimeEnd,
      WEEKDAY_WAGE: tempWeekdayWage,
      WEEKEND_WAGE: tempWeekendWage,
      COMMUTING_COST: tempCommutingCost,
      PAY_INTERVAL_MINUTES: tempPayIntervalMinutes,
    };

    // Save settings to Firebase and notify the user
    await saveSettings(settingsToSave);
    alert("Settings saved successfully!");
  };

  const generateOptions = (start, end) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(
      (value) => (
        <MenuItem key={value} value={value}>
          {value}
        </MenuItem>
      )
    );
  };

  const generateMinuteOptions = (step) => {
    return Array.from({ length: 60 / step }, (_, i) => i * step).map(
      (value) => (
        <MenuItem key={value} value={value}>
          {String(value).padStart(2, "0")}
        </MenuItem>
      )
    );
  };

  // Display a loading spinner while fetching settings
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="page" id="settings-page">
      <Paper elevation={3} sx={{ padding: 3, maxWidth: 600, margin: "0 auto" }}>
        <Typography variant="h5" gutterBottom sx={{ marginBottom: 3 }}>
          Work Settings
        </Typography>

        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "grid", gap: 3 }}
        >
          {/* Default Work Hours */}
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Default Work Hours
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={3}>
                <Typography>Start Time:</Typography>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Hour"
                  value={tempDefaultStartTime.hour}
                  onChange={(e) => handleChange(e, "DefaultStartHour")}
                >
                  {generateOptions(
                    tempWorktimeStart.hour,
                    tempDefaultEndTime.hour - 1
                  )}
                </TextField>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Minute"
                  value={tempDefaultStartTime.minute}
                  onChange={(e) => handleChange(e, "DefaultStartMinute")}
                >
                  {generateMinuteOptions(tempPayIntervalMinutes)}
                </TextField>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ marginTop: 1 }}
            >
              <Grid xs={3}>
                <Typography>End Time:</Typography>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Hour"
                  value={tempDefaultEndTime.hour}
                  onChange={(e) => handleChange(e, "DefaultEndHour")}
                >
                  {generateOptions(
                    tempDefaultStartTime.hour + 1,
                    tempWorktimeEnd.hour
                  )}
                </TextField>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Minute"
                  value={tempDefaultEndTime.minute}
                  onChange={(e) => handleChange(e, "DefaultEndMinute")}
                >
                  {generateMinuteOptions(tempPayIntervalMinutes)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Worktime Range */}
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Worktime Range
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid xs={3}>
                <Typography>Earliest Start:</Typography>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Hour"
                  value={tempWorktimeStart.hour}
                  onChange={(e) => handleChange(e, "EarliestStartHour")}
                >
                  {generateOptions(1, tempWorktimeEnd.hour - 1)}
                </TextField>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Minute"
                  value={tempWorktimeStart.minute}
                  onChange={(e) => handleChange(e, "EarliestStartMinute")}
                >
                  {generateMinuteOptions(tempPayIntervalMinutes)}
                </TextField>
              </Grid>
            </Grid>
            <Grid
              container
              spacing={2}
              alignItems="center"
              sx={{ marginTop: 1 }}
            >
              <Grid xs={3}>
                <Typography>Latest End:</Typography>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Hour"
                  value={tempWorktimeEnd.hour}
                  onChange={(e) => handleChange(e, "LatestEndHour")}
                >
                  {generateOptions(tempWorktimeStart.hour + 1, 24)}
                </TextField>
              </Grid>
              <Grid xs={4.5}>
                <TextField
                  select
                  fullWidth
                  label="Minute"
                  value={tempWorktimeEnd.minute}
                  onChange={(e) => handleChange(e, "LatestEndMinute")}
                >
                  {generateMinuteOptions(tempPayIntervalMinutes)}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Wage Settings */}
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wage Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  label="Weekday Wage"
                  type="number"
                  value={tempWeekdayWage}
                  onChange={(e) => handleChange(e, "WeekdayWage")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">¥</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  label="Weekend Wage"
                  type="number"
                  value={tempWeekendWage}
                  onChange={(e) => handleChange(e, "WeekendWage")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">¥</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* Other Settings */}
          <Paper elevation={2} sx={{ padding: 3 }}>
            <Typography variant="h6" gutterBottom>
              Other Settings
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={6}>
                <TextField
                  fullWidth
                  label="Commuting Cost"
                  type="number"
                  value={tempCommutingCost}
                  onChange={(e) => handleChange(e, "CommutingCost")}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">¥</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid xs={6}>
                <TextField
                  select
                  fullWidth
                  label="Pay Interval"
                  value={tempPayIntervalMinutes}
                  onChange={(e) => handleChange(e, "PayIntervalMinutes")}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">min</InputAdornment>
                    ),
                  }}
                >
                  {[1, 5, 10, 15, 30, 60].map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Paper>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: 2,
            }}
          >
            <Button variant="contained" color="primary" onClick={handleSave}>
              Save Settings
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
}

export default SettingsPage;
