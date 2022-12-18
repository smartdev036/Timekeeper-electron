import styles from './App.module.scss';
import Container from './reusable/components/Container';
import {
    Routes,
    Route,
    NavLink,
    Navigate,
    useLocation,
    HashRouter,
} from "react-router-dom";
import { ThemeProvider } from '@mui/material';
import theme from './theme';
// import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from "@mui/x-date-pickers";
// import LocalizationProvider from '@mui/lab/LocalizationProvider';
import { FiClock } from 'react-icons/fi';
import clsx from 'clsx';
import Controllers from './components/Controllers/Controllers';
import EditPositions from './components/EditPositions/EditPositions';
import Bullpen from './components/Bullpen/Bullpen';
import DailyLogs from './components/DailyLogs/DailyLogs';
import Reports from './components/Reports/Reports';
import PositionsGrid from './components/Positions/PositionsGrid';
import AllDailyValidated from './components/DailyLogs/AllDailyValidated';
import { ProvideReRender } from './reusable/hooks/useReRender';
import Logo from "./static/logo.png"
import { useInterval } from 'react-use';
import { useEffect, useState } from 'react';
import LocalDate from './reusable/LocalDate';
import LocalTime from './reusable/LocalTime';
import ErrorBoundary from './reusable/components/ErrorBoundary';
import Settings from './components/Settings/Settings';

interface RouterLinkProps {
    to: string
    label: string
}

const RouterLink = ({ to, label }: RouterLinkProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => clsx(styles.RouterLink, isActive ? styles.active : "")}
        >{label}</NavLink>
    )
}

const All = () => {
    const location = useLocation()
    return <span>{location.pathname}</span>
}

const Inner = () => {
    const [localDate, setLocalDate] = useState(new LocalDate())
    const [localTime, setLocalTime] = useState(new LocalTime())

    useInterval(() => {
        setLocalDate(new LocalDate())
        setLocalTime(new LocalTime())
    }, 10 * 1000)

    const utcTime = localTime.convertToUTC()

    const localTimeDateString = `${localDate.getMonthName()} ${localDate.date}`

    return (
        <Container className={styles.App} dir="row" noMargin={true}>
            <Container className={styles.Main} >
                <Container noMargin={true} className={styles.Header}>
                    <img src={Logo} className={styles.Logo} />
                    <div className={styles.Time}><FiClock />{localTimeDateString} | {localTime.formatToString()} | {utcTime.formatToZ()}</div>
                </Container>
                <Container noMargin={true} className={styles.InnerContainer}>
                    <Routes>
                        <Route path="/" element={<PositionsGrid />} />
                        <Route path="/bullpen" element={<Bullpen />} />
                        <Route path="/controllers" element={<Controllers />} />
                        <Route path="/edit-positions" element={<EditPositions />} />
                        <Route path="/daily-logs" element={<DailyLogs />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Container>
            </Container>
            <Container className={styles.Side} noMargin={true}>
                <Container className={styles.SideHeader}>Menu</Container>
                <Container className={styles.SideInner} noMargin={true}>
                    <RouterLink to="/" label="Status" />
                    <RouterLink to="/bullpen" label="Bullpen" />
                    <RouterLink to="/controllers" label="Controllers" />
                    <Container />
                    <RouterLink to="/edit-positions" label="Positions" />
                    <RouterLink to="/reports" label="Reports" />
                    <RouterLink to="/settings" label="Settings" />
                </Container>
                <Container push="bottom" noMargin={true}>
                    <AllDailyValidated />
                </Container>
            </Container>
        </Container>
    )
}

function App() {
    useEffect(() => {
        console.log("App is running ....")
    }, [])
    return (
        <ErrorBoundary>
            <ThemeProvider theme={theme}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <ProvideReRender>
                        <HashRouter>
                            <Inner />
                        </HashRouter>
                    </ProvideReRender>
                </LocalizationProvider>
            </ThemeProvider>
        </ErrorBoundary>
    )
}

export default App;
