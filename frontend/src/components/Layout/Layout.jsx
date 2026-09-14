import Navbar from "../Navbar/Navbar";
import Sidebar from "../Sidebar/Sidebar";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar />
      <div className="layout__body">
        <Sidebar />
        <main className="layout__content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
