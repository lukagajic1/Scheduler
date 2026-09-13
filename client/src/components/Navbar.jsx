import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function navigationClass(linkInformation) {
  let className =
    "flex items-center justify-center " +
    "border border-[#625A83] px-5 py-1 " +
    "text-sm text-white no-underline transition-colors " +
    "hover:bg-[#554C7A] ";

  if (linkInformation.isActive) {
    className += "bg-[#554C7A]";
  } else {
    className += "bg-[#494268]";
  }

  return className;
}

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  let accountSection;

  if (user) {
    accountSection = (
      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-purple-100 sm:inline">
          {user.email}
        </span>

        <button
          type="button"
          onClick={handleLogout}
          className="cursor-pointer text-white underline underline-offset-4"
        >
          Log Out
        </button>
      </div>
    );
  } else {
    accountSection = (
      <NavLink className="text-white underline underline-offset-4" to="/login">
        Log In
      </NavLink>
    );
  }

  return (
    <>
      <header className="flex min-h-20 items-center justify-between bg-[#6558B1] px-12 text-white max-sm:min-h-16 max-sm:px-5">
        <NavLink
          className="text-3xl font-bold tracking-wide text-white no-underline max-sm:text-2xl"
          to="/"
        >
          Scheduler
        </NavLink>

        {accountSection}
      </header>

      <nav
        className="flex gap-1 overflow-x-auto bg-[#3F395F] px-3 py-2"
        aria-label="Main navigation"
      >
        <NavLink className={navigationClass} to="/">
          Home
        </NavLink>

        <NavLink className={navigationClass} to="/about">
          About
        </NavLink>

        <NavLink className={navigationClass} to="/schedule">
          Schedule
        </NavLink>

        <NavLink className={navigationClass} to="/clients">
          Clients
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;
