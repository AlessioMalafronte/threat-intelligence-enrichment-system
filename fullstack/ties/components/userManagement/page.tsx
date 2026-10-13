"use client";
import { useEffect, useState } from 'react';
import { UserWithCompany, AuthPayload, Company } from '@/types/User';

function AddCompanyModal({ onClose, onCompanyAdded }: { onClose: () => void; onCompanyAdded: () => void }) {
  const [name, setName] = useState('');
  const [p_iva, setP_iva] = useState('');
  const [vip, setVip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, p_iva, vip }),
      });
      if (response.ok) {
        setSuccess('Company added successfully!');
        onCompanyAdded();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add company.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="modalBackdrop">
      <div className="modalContent">
        <h2 className="modalTitle">Add New Company</h2>
        <form onSubmit={handleSubmit} className="modalForm">
          <input
            type="text"
            placeholder="Company Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
          <input
            type="text"
            placeholder="P.IVA"
            value={p_iva}
            onChange={(e) => setP_iva(e.target.value)}
            className="input"
            required
          />
          <label className="checkboxLabel">
            <input
              type="checkbox"
              checked={vip}
              onChange={(e) => setVip(e.target.checked)}
            />
            VIP
          </label>
          {error && <p className="errorMessage">{error}</p>}
          {success && <p className="successMessage">{success}</p>}
          <button type="submit" className="modalButton">Add Company</button>
          <button type="button" onClick={onClose} className="modalButtonSecondary">Close</button>
        </form>
      </div>
    </div>
  );
}

// Componente modale per l'aggiunta di utenti (aggiornato)
function AddUserModal({ onClose, onUserAdded, companies, userRole, editorCompanyId }: { onClose: () => void; onUserAdded: () => void; companies: Company[]; userRole: 'admin' | 'editor' | 'user' | null; editorCompanyId: number | null }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState<string>('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'editor'>('user'); // Nuovo stato per il ruolo del nuovo utente
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Imposta il valore di default del campo company se l'utente loggato è un editor
  useEffect(() => {
    if (userRole === 'editor' && editorCompanyId !== null) {
      setCompany(String(editorCompanyId));
    }
  }, [userRole, editorCompanyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // CORREZIONE: Ho dichiarato il tipo del payload in anticipo,
    // includendo la proprietà 'company' come opzionale per evitare l'errore di tipo.
    let payload: { username: string, email: string, password: string, role?: string, company?: number } = {
      username,
      email,
      password,
    };

    // La logica di creazione cambia in base al ruolo dell'utente che usa il form
    if (userRole === 'admin') {
      // Un admin può creare editor o utenti e scegliere l'azienda
      payload.role = newUserRole;
      payload.company = parseInt(company);
    } else if (userRole === 'editor') {
      // Un editor può creare solo utenti e l'azienda è predefinita
      payload.role = 'user';
      payload.company = editorCompanyId!;
    }

    try {
      const response = await fetch('/api/user/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSuccess('User created successfully!');
        onUserAdded();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add user.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
  };

  const newRoleText = userRole === 'admin' ? newUserRole : 'User';

  return (
    <div className="modalBackdrop">
      <div className="modalContent">
        <h2 className="modalTitle">Add New {newRoleText === 'user' ? 'User' : 'Editor'}</h2>
        <form onSubmit={handleSubmit} className="modalForm">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
          />

          {/* Se l'utente loggato è un admin, mostra i selettori di ruolo e azienda */}
          {userRole === 'admin' && (
            <>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as 'user' | 'editor')}
                className="input"
                required
              >
                <option value="user">User</option>
                <option value="editor">Editor</option>
              </select>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input"
                required
              >
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {error && <p className="errorMessage">{error}</p>}
          {success && <p className="successMessage">{success}</p>}
          <button type="submit" className="modalButton">Add {newRoleText === 'user' ? 'User' : 'Editor'}</button>
          <button type="button" onClick={onClose} className="modalButtonSecondary">Close</button>
        </form>
      </div>
    </div>
  );
}

// Componente principale di gestione utenze (aggiornato)
export default function UserManagementComponent() {
  const [users, setUsers] = useState<UserWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddCompanyModalOpen, setIsAddCompanyModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'editor' | 'user' | null>(null);
  const [editorCompanyId, setEditorCompanyId] = useState<number | null>(null); // Nuovo stato per l'ID azienda dell'editor

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/user/management');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to fetch users.');
      }
    } catch (err) {
      setError('An unexpected error occurred while fetching users.');
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      } else {
        const data = await response.json();
        console.error('Failed to fetch companies.');
      }
    } catch (err) {
      console.error('An unexpected error occurred while fetching companies.', err);
    }
  };
  
  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/user/info');
      if (response.ok) {
        const { role, companyId } = await response.json() as AuthPayload;
        setUserRole(role);
        // Se l'utente è un editor, salviamo il suo ID azienda
        if (role === 'editor') {
          setEditorCompanyId(companyId!);
        }
      } else {
        setError("User not authenticated.");
      }
    } catch (err) {
      setError("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchUsers();
    fetchCompanies();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="managementContainer">
      <div className="header">
        <h1 className="title">User & Company Management</h1>
        <div className="buttons">
          {userRole === 'admin' && (
            <button onClick={() => setIsAddCompanyModalOpen(true)} className="actionButton">
              Add Company
            </button>
          )}
          {(userRole === 'admin' || userRole === 'editor') && (
            <button onClick={() => setIsAddUserModalOpen(true)} className="actionButton">
              Add User
            </button>
          )}
        </div>
      </div>
      
      <h2 className="subtitle">Users</h2>
      <table className="userTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Company</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.company_name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddCompanyModalOpen && (
        <AddCompanyModal 
          onClose={() => setIsAddCompanyModalOpen(false)} 
          onCompanyAdded={() => {
            fetchCompanies();
            setIsAddCompanyModalOpen(false);
          }}
        />
      )}

      {isAddUserModalOpen && (
        <AddUserModal 
          onClose={() => setIsAddUserModalOpen(false)} 
          onUserAdded={() => {
            fetchUsers();
            setIsAddUserModalOpen(false);
          }}
          companies={companies}
          userRole={userRole}
          editorCompanyId={editorCompanyId}
        />
      )}
      <style>{`
        body {
          margin: 0;
          padding: 0;
        }

        .managementContainer {
          font-family: 'Inter', sans-serif;
          background-color: #2D3748;
          color: #D2CBFC;
          min-height: 100vh;
          padding: 2rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #D2CBFC;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #D2CBFC;
        }

        .buttons {
          display: flex;
          gap: 1rem;
        }

        .actionButton {
          padding: 12px 20px;
          border-radius: 10px;
          border: none;
          background-color: #D2CBFC;
          color: #36438E;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s ease, transform 0.2s ease;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        }

        .actionButton:hover {
          background-color: #bdadf1;
          transform: translateY(-2px);
        }
        
        .subtitle {
          font-size: 1.8rem;
          font-weight: 600;
          color: #D2CBFC;
          margin-top: 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .userTable {
          width: 100%;
          border-collapse: collapse;
          background-color: #36438E;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .userTable th, .userTable td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #4A5568;
        }
        
        .userTable th {
          background-color: #3B4B98;
          font-weight: bold;
          text-transform: uppercase;
          color: #D2CBFC;
        }
        
        .userTable tr:hover {
          background-color: #4A5568;
        }

        .loading, .error {
          text-align: center;
          font-size: 1.5rem;
          color: #D2CBFC;
          margin-top: 2rem;
        }
        
        .modalBackdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modalContent {
          background-color: #36438E;
          color: #D2CBFC;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          width: 400px;
          max-width: 90%;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .modalTitle {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }
        
        .modalForm {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .input, .modalButton, .modalButtonSecondary {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: bold;
          box-sizing: border-box;
        }

        .input {
          background-color: #4A5568;
          border: 1px solid #667EEA;
          color: #D2CBFC;
          padding: 12px;
        }

        .input::placeholder {
          color: #A0AEC0;
        }
        
        .modalButton {
          border: none;
          cursor: pointer;
          transition: background-color 0.3s ease;
          background-color: #D2CBFC;
          color: #36438E;
        }
        
        .modalButton:hover {
          background-color: #bdadf1;
        }
        
        .modalButtonSecondary {
          border: 1px solid #D2CBFC;
          background-color: transparent;
          color: #D2CBFC;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }
        
        .modalButtonSecondary:hover {
          background-color: rgba(210, 203, 252, 0.2);
        }
        
        .errorMessage {
          color: #ffcccc;
          text-align: center;
          margin-top: -0.5rem;
        }
        
        .successMessage {
          color: #ccffcc;
          text-align: center;
          margin-top: -0.5rem;
        }
        
        .checkboxLabel {
          color: #D2CBFC;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .checkboxLabel input {
          width: auto;
        }
      `}</style>
    </div>
  );
}
