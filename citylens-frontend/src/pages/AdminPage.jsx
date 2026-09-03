import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ArrowLeft, AlertTriangle} from "lucide-react";
import { getAllUsers, deleteUser } from "../services/adminService";
import "./AdminPage.css";

const getDaysSince = (dateString) => {
  if (!dateString) return null;

  const difference = Date.now() - new Date(dateString).getTime();
  return Math.floor(difference / (1000 * 60 * 60 * 24));
};

const formatDate = (dateString) => {
  if (!dateString) return "-";

  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLastLoginText = (dateString) => {
  if (!dateString) return "Never logged in";

  const days = getDaysSince(dateString);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";

  return `${days} days ago`;
};

const AdminPage = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Error while loading the users:", error);
        setErrorMsg("Could not load users.");
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);


const isInactive = (user) => {
    const days = getDaysSince(user.lastLogin);
    return user.lastLogin === null || (days !== null && days >= 30);
};

const handleDelete = async (user) => {
    const confirmed = window.confirm(
        `Delete the account ${user.email}?`
    );

    if(!confirmed)
        return;

    try {
        await deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
    }
    catch (error) {
        console.error("Error while deleting the user:", error);
        alert("Couldn't delete the user.");
    }
};

if(isLoading) {
    return (
        <div className="admin-page">
            <div className="admin-loading">Loading users...</div>
        </div>
    );
}

return (
  <div className="admin-page">
    <header className="admin-header">
      <button className="admin-back" onClick={() => navigate("/home")}>
        <ArrowLeft size={18} /> Back
      </button>
      <div className="admin-title-wrap"> 
        <h1 className="admin-title">User Management</h1>
      </div>
      <span className="admin-count">{users.length} users</span>
    </header>

    {errorMsg && <div className="admin-error">{errorMsg}</div>}

    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Registered</th>
            <th>Last login</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = user.role === "ROLE_ADMIN";
            const userInactive = isInactive(user);

            return (
              <tr
                key={user.id}
                className={userInactive && !isAdmin ? "row-inactive" : ""}
                >
                  <td className="cell-email">{user.email}</td>
                  <td>
                    <span className={`role-badge ${isAdmin ? "role-admin" : "role-user"}`}>
                      {isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <span className={userInactive && !isAdmin ? "last-login inactive" : "last-login"}>
                      {userInactive && !isAdmin&& <AlertTriangle size={13} />}
                      {getLastLoginText(user.lastLogin)}
                    </span>
                  </td>
                  <td>
                    {!isAdmin && (
                      <button 
                       className="admin-del-btn"
                       onClick={() => handleDelete(user)}
                       title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);
};

export default AdminPage;



