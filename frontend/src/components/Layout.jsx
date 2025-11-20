import './Layout.css';
import {Link, Outlet} from "react-router-dom";
import ColorModeSelect from '../contexts/theme/ColorModeSelect';

const Layout = () => {
  return <>
    {/*<header>*/}
    {/*    <Link to="/" className="link">AppName</Link>*/}
    {/*</header>*/}
    <main>
        <Outlet />
    </main>
    {/*<footer>*/}
    {/*    &copy; CSC309, {get_academic_term()}, University of Toronto.*/}
    {/*</footer>*/}
  </>;
};

export default Layout;
