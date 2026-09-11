"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

type AdminUser = { id: number; username: string; email: string; role: "USER" | "ADMIN"; banned: boolean; createdAt: string; postCount: number };

export default function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const loadUsers = async () => { const response = await fetch("/api/admin/users", { credentials: "include" }); if (response.ok) setUsers(await response.json()); else setMessage("Nie udało się pobrać użytkowników."); };
  useEffect(() => { const timer = window.setTimeout(loadUsers, 0); return () => window.clearTimeout(timer); }, []);
  const changeRole = async (username: string, role: "USER" | "ADMIN") => { const response = await fetch("/api/admin/users", { method: "PATCH", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, role }) }); const result = await response.json(); if (!response.ok) return setMessage(result.error ?? "Nie udało się zmienić roli."); setMessage(`Rola użytkownika ${username} została zmieniona.`); loadUsers(); };
  const resetPassword = async (username: string) => { const password = passwords[username] ?? ""; const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}/password`, { method: "PATCH", credentials: "include", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); const result = await response.json(); if (!response.ok) return setMessage(result.error ?? "Nie udało się zmienić hasła."); setPasswords((current) => ({ ...current, [username]: "" })); setMessage(`Hasło użytkownika ${username} zostało zmienione. Aktywne sesje zostały wylogowane.`); };
  return <main className="admin-page"><header className="admin-header"><Link href="/" className="admin-back"><ArrowLeft size={16} /> WAPROMO</Link><span><ShieldCheck size={16} /> Panel administratora</span></header><section className="admin-content"><div className="eyebrow green">ZARZĄDZANIE UŻYTKOWNIKAMI</div><h1>Profile i role</h1><p className="admin-intro">Możesz zmieniać role i ustawiać nowe hasła. Istniejące hasła nigdy nie są wyświetlane, ponieważ przechowywane są wyłącznie jako hashe bcrypt.</p>{message && <div className="admin-message">{message}</div>}<div className="admin-table">{users.map((user) => <div className="admin-row" key={user.id}><div className="profile-avatar">{user.username.slice(0, 2).toUpperCase()}</div><div className="admin-user"><b>{user.username}</b><small>{user.email} · {user.postCount} postów</small></div><time>{new Date(user.createdAt).toLocaleDateString("pl-PL")}</time><select value={user.role} onChange={(event) => changeRole(user.username, event.target.value as "USER" | "ADMIN")}><option value="USER">Użytkownik</option><option value="ADMIN">Administrator</option></select><div className="password-reset"><input type="password" minLength={8} placeholder="Nowe hasło" value={passwords[user.username] ?? ""} onChange={(event) => setPasswords((current) => ({ ...current, [user.username]: event.target.value }))} /><button onClick={() => resetPassword(user.username)}>Ustaw</button></div></div>)}</div></section></main>;
}
