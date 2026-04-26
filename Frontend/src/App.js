import React, { useState, createContext, useContext } from 'react';
import { ThemeProvider, withStyles } from 'react-jss';
import { BrowserRouter, Switch, Route, useHistory } from 'react-router-dom';
import { FaChessBishop, FaPlusCircle } from 'react-icons/fa';
import { RiMoonClearLine, RiSunLine } from 'react-icons/ri';

// IMPORT CÁC TRANG CỦA PHÚC
import DepartmentList from './pages/DepartmentList'; 
import DepartmentAdd from './pages/DepartmentAdd';

/* ============================ 1. STYLES (GIỮ NGUYÊN) ============================== */
const mainTheme = {
   sizes: { container: '850px' },
   colors: {
      primary: '#4299e1',
      primaryLight: '#fff',
      secondary: '#818CF8',
      secondaryLight: '#fff',
      green: '#10B981'
   }
}

const lightTheme = {
   ...mainTheme,
   type: 'light',
   background: { default: '#f7fafc', paper: '#fff', linkHover: '#edf2f7', input: '#fff' },
   alert: { error: '#fff0f3', success: '#a7f3d0' },
   border: { primary: '#e2e2e2', input: '#e2e8f0' },
   text: { primary: '#000', link: '#718096', activeLink: '#2b3044', input: '#4a5568' },
   blob: 'C7D2FE'
}

const darkTheme = {
   ...mainTheme,
   type: 'dark',
   background: { default: '#161a23', paper: '#252836', linkHover: '#1c2633', input: '#2d303e' },
   alert: { error: '#a54a5c', success: '#359a6c' },
   border: { primary: '#43454e', input: '#505261' },
   text: { primary: '#fff', link: '#8493a9', activeLink: '#9b9fb1', input: '#cccede' },
   blob: '6373b3'
}

const loginLayoutStyles = theme => ({
   loginLayout: {
      maxWidth: '100vw', minHeight: '100vh', display: 'flex',
      justifyContent: 'center', alignItems: 'center',
      background: `${theme.background.default} url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><path fill="%23${theme.blob}" d="M41.3,-52.9C54.4,-47.3,66.6,-36.4,73.8,-22.1C81,-7.8,83.2,10,75.4,21.7C67.7,33.4,50.1,39.1,35.9,47.5C21.7,56,10.8,67.3,0,67.3C-10.8,67.3,-21.6,55.9,-35.7,47.4C-49.9,38.9,-67.3,33.2,-70,23.2C-72.7,13.1,-60.6,-1.3,-53.8,-15.9C-46.9,-30.5,-45.3,-45.3,-37.2,-52.5C-29.1,-59.7,-14.6,-59.4,-0.2,-59.1C14.1,-58.7,28.2,-58.5,41.3,-52.9Z" transform="translate(100 100) scale(1.21)"/></svg>') 50% no-repeat`,
   },
   rightAngleAction: { position: 'absolute', top: '10px', right: '20px' }
});

const loginPageStyles = theme => ({
   '@keyframes slideLeft': { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0px)' } },
   loginCard: { animation: '$slideLeft ease-in 0.3s', boxShadow: '0 2px 20px 3px rgb(0 0 0 / 6%)', background: theme.background.paper, color: theme.text.primary, width: '410px', padding: '2rem', position: 'relative', borderRadius: '8px' },
   cardHeader: { color: theme.text.activeLink, fontWeight: 600, fontSize: '1.6em', marginBottom: '1rem' }
});

const buttonStyles = theme => ({
   buttonMain: { width: props => props.fullWidth ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '.75rem 1.5rem', background: props => props.color ? theme.colors[props.color] : theme.colors.primary, borderRadius: '.25rem', border: 'none', color: '#fff', cursor: 'pointer', '&:hover': { filter: 'brightness(90%)' } },
   iconLeft: { marginRight: '.5rem', display: 'flex', alignItems: 'center' }
});

const inputStyles = theme => ({
   inputMain: { color: theme.text.input, fontSize: '.875rem', padding: '.5rem .75rem', borderRadius: '.25rem', outline: 'none', backgroundColor: theme.background.input, border: `1px solid ${theme.border.input}`, width: '100%', marginTop: '.5rem' },
   inputWrapper: { display: 'flex' }
});

const toggleThemeButtonStyles = theme => ({
   button: { border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '2em', outline: 'none' }
});

const alertStyles = theme => ({
   alert: { padding: '15px', borderRadius: '4px', margin: '10px 0', fontSize: '.875rem' }
});

/* ============================ 2. COMPONENTS ============================== */
const CustomThemeContext = createContext();
const CustomThemeProvider = props => {
   const [currentTheme, setCurrentTheme] = useState('light');
   const toggleTheme = () => setCurrentTheme(currentTheme === 'light' ? 'dark' : 'light');
   return (
      <CustomThemeContext.Provider value={{ currentTheme, toggleTheme }}>
         <ThemeProvider theme={currentTheme === 'light' ? lightTheme : darkTheme}>{props.children}</ThemeProvider>
      </CustomThemeContext.Provider>
   );
};

let ToggleThemeButton = ({ classes }) => {
   const { currentTheme, toggleTheme } = useContext(CustomThemeContext);
   return (
      <button className={classes.button} onClick={toggleTheme}>
         {currentTheme === 'light' ? <RiMoonClearLine /> : <RiSunLine color="white" />}
      </button>
   );
};
ToggleThemeButton = withStyles(toggleThemeButtonStyles)(ToggleThemeButton);

let LoginLayout = ({ classes, children }) => (
   <div className={classes.loginLayout}>
      <div className={classes.rightAngleAction}><ToggleThemeButton /></div>
      {children}
   </div>
);
LoginLayout = withStyles(loginLayoutStyles)(LoginLayout);

let Alert = withStyles(alertStyles)(({ classes, title, children, type }) => (
   <div className={classes.alert} style={{ backgroundColor: type === 'success' ? '#a7f3d0' : '#fff0f3' }}>
      <summary style={{ fontWeight: 700 }}>{title}</summary>
      {children}
   </div>
));

let Input = withStyles(inputStyles)(({ classes, ...props }) => (
   <div className={classes.inputWrapper}><input className={classes.inputMain} {...props} /></div>
));

let Button = withStyles(buttonStyles)(({ classes, children, iconLeft, ...props }) => (
   <button className={classes.buttonMain} {...props}>
      {iconLeft && <span className={classes.iconLeft}>{iconLeft}</span>}
      {children}
   </button>
));

/* ============================ 3. PAGES (LOGIN) ============================== */
let LoginPage = withStyles(loginPageStyles)(({ classes }) => {
   const history = useHistory();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isSuccessed, setSuccess] = useState(false);

   const loginSubmitHandler = (e) => {
      e.preventDefault();
      if (email && password.length >= 6) {
         setSuccess(true);
         setTimeout(() => { history.push('/departments'); }, 1000);
      }
   };

   return (
      <div className={classes.loginCard}>
         <div style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
            <FaChessBishop style={{ marginRight: '10px', fontSize: '1.3em', color: '#83afe0' }} />
            <span>Amazing service</span>
         </div>
         <h1 className={classes.cardHeader}>Log in</h1>
         <form onSubmit={loginSubmitHandler}>
            {isSuccessed && <Alert title="Welcome!" type="success" />}
            <div style={{ marginBottom: '1rem' }}>
               <label style={{ fontSize: '.875rem' }}>Email</label>
               <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email của bạn" />
            </div>
            <div style={{ marginBottom: '1rem' }}>
               <label style={{ fontSize: '.875rem' }}>Password</label>
               <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" fullWidth style={{ marginTop: '10px' }}>Log in</Button>
         </form>
         <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
            <div style={{ height: '1px', width: '100%', background: '#d1d5db' }}></div>
            <p style={{ margin: '0 10px', color: '#94979c' }}>OR</p>
            <div style={{ height: '1px', width: '100%', background: '#d1d5db' }}></div>
         </div>
         <Button fullWidth onClick={() => history.push('/registration')} color="green" iconLeft={<FaPlusCircle />}>Create account</Button>
      </div>
   );
});

/* ============================ 4. APP MAIN (FIXED) ============================== */
function App() {
   return (
      <CustomThemeProvider>
         <BrowserRouter>
            <Switch>
               {/* 1. TRANG THÊM PHÒNG BAN: Phải nằm TRÊN trang danh sách và có exact */}
               <Route 
                  exact 
                  path="/departments/add" 
                  component={DepartmentAdd} 
               />

               {/* 2. TRANG DANH SÁCH PHÒNG BAN */}
               <Route 
                  exact 
                  path="/departments" 
                  component={DepartmentList} 
               />

               {/* 3. TRANG REGISTRATION */}
               <Route exact path="/registration">
                  <LoginLayout><div style={{color:'white'}}>Sign Up Page</div></LoginLayout>
               </Route>

               {/* 4. TRANG LOGIN (MẶC ĐỊNH CHO CÁC ĐƯỜNG DẪN KHÁC) */}
               <Route path="*">
                  <LoginLayout><LoginPage /></LoginLayout>
               </Route>
            </Switch>
         </BrowserRouter>
      </CustomThemeProvider>
   );
}

export default App;