import React, { useState, useEffect } from "react";
import { Sermon, Book, Course, ChurchEvent, StudyResource, BroadcastEmail } from "../types.js";
import { 
  Lock, LayoutDashboard, Plus, Trash2, Mail, Check, AlertCircle, 
  BookOpen, Video, Calendar, Eye, Send, FileText, GraduationCap 
} from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"sermons" | "books" | "courses" | "events" | "resources" | "broadcaster">("sermons");

  // Data pools
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastEmail[]>([]);

  // Broadcaster states
  const [emailSubject, setEmailSubject] = useState("Weekly Study Bulletin: Putting on the Whole Armor of God");
  const [emailBody, setEmailBody] = useState("Beloved,\n\nI want to encourage you this week to standing strong in Ephesians 6. The whole armor of God is not armor of steel, but armor of grace and light. Spend time in the study modules and let His Peace shield your thoughts.\n\nBlessings,\nPst. Ken");
  const [emailRecipientGroup, setEmailRecipientGroup] = useState("members");
  const [testEmail, setTestEmail] = useState("acemayeson8@gmail.com");
  const [emailStatus, setEmailStatus] = useState<{ type: "success" | "error" | "sending" | ""; message: string }>({ type: "", message: "" });

  // Creation forms
  const [showAddForm, setShowAddForm] = useState(false);

  // Forms states
  const [sermonForm, setSermonForm] = useState({ title: "", speaker: "Pastor Ken", date: "", series: "", videoUrl: "", audioUrl: "", description: "", notes: "" });
  const [bookForm, setBookForm] = useState({ title: "", author: "Pastor Ken", coverUrl: "", description: "", downloadUrl: "#", pages: 120, category: "Theology" });
  const [eventForm, setEventForm] = useState({ title: "", date: "", time: "10:00 AM", location: "Sanctuary", description: "", image: "", type: "service" as any });
  const [resourceForm, setResourceForm] = useState({ title: "", category: "Sermon Companion", fileType: "PDF Document", description: "", downloadUrl: "#", fileSize: "1.2 MB" });

  useEffect(() => {
    // Check local storage for session
    const savedToken = localStorage.getItem("pastor_ken_session");
    if (savedToken === "admin_token_session_ace_ken") {
      setIsLoggedIn(true);
      loadAllData();
    }
  }, []);

  const loadAllData = () => {
    fetch("/api/sermons").then(res => res.json()).then(data => setSermons(data));
    fetch("/api/books").then(res => res.json()).then(data => setBooks(data));
    fetch("/api/courses").then(res => res.json()).then(data => setCourses(data));
    fetch("/api/events").then(res => res.json()).then(data => setEvents(data));
    fetch("/api/resources").then(res => res.json()).then(data => setResources(data));
    fetch("/api/emails").then(res => res.json()).then(data => setBroadcasts(data));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("pastor_ken_session", data.token);
        setIsLoggedIn(true);
        loadAllData();
      } else {
        setLoginError(data.message || "Invalid Pastor credentials.");
      }
    } catch {
      setLoginError("Internal Server Authentication failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pastor_ken_session");
    setIsLoggedIn(false);
  };

  // Create Item triggers
  const handleCreateSermon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sermonForm)
      });
      if (res.ok) {
        setShowAddForm(false);
        loadAllData();
        setSermonForm({ title: "", speaker: "Pastor Ken", date: "", series: "", videoUrl: "", audioUrl: "", description: "", notes: "" });
      }
    } catch {
      alert("Error building sermon");
    }
  };

  const handleDeleteSermon = async (id: string) => {
    if (!confirm("Are you sure you want to remove this sermon outline? All transcripts will be purged.")) return;
    try {
      const res = await fetch(`/api/admin/sermons/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch {
      alert("Purger Failed");
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookForm)
      });
      if (res.ok) {
        setShowAddForm(false);
        loadAllData();
        setBookForm({ title: "", author: "Pastor Ken", coverUrl: "", description: "", downloadUrl: "#", pages: 120, category: "Theology" });
      }
    } catch {
      alert("Error adding volume");
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to remove this library volume?")) return;
    try {
      const res = await fetch(`/api/admin/books/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch {
      alert("Book deletion failed");
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventForm)
      });
      if (res.ok) {
        setShowAddForm(false);
        loadAllData();
        setEventForm({ title: "", date: "", time: "10:00 AM", location: "Sanctuary", description: "", image: "", type: "service" });
      }
    } catch {
      alert("Error planning Event");
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Purge event from study schedules?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch {
      alert("Purger failed");
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resourceForm)
      });
      if (res.ok) {
        setShowAddForm(false);
        loadAllData();
        setResourceForm({ title: "", category: "Sermon Companion", fileType: "PDF Document", description: "", downloadUrl: "#", fileSize: "1.2 MB" });
      }
    } catch {
      alert("Error compiling resource handout");
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Purge resource sheet?")) return;
    try {
      const res = await fetch(`/api/admin/resources/${id}`, { method: "DELETE" });
      if (res.ok) loadAllData();
    } catch {
      alert("Resource extraction failed");
    }
  };

  const handleSendBroadcastEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus({ type: "sending", message: "Connecting to Resend Servers and transmitting mail..." });

    try {
      const res = await fetch("/api/admin/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          targetGroup: emailRecipientGroup,
          testEmailAddress: testEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailStatus({ type: "success", message: `Broadcast Sent Live! ${data.message} Email dispatched to ${testEmail}` });
        loadAllData();
      } else {
        const errorMsg = data.errors ? data.errors.join(", ") : "API Error";
        setEmailStatus({ 
          type: "error", 
          message: `Broadcaster recorded locally as draft, but Resend API connection failed. ${data.message || ""}. ${errorMsg}` 
        });
        loadAllData();
      }
    } catch (err: any) {
      setEmailStatus({ type: "error", message: `Communication Error: ${err.message}` });
    }
  };

  const handleSimulateAddCourse = () => {
    alert("Faith Course curriculum generator can is active. It requires modules structure arrays. Select database default course in Academy lists to verify structures.");
  };

  if (!isLoggedIn) {
    return (
      <div id="admin-gate-card" className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden text-left">
        <div className="p-6 bg-stone-900 text-stone-100 flex items-center space-x-3">
          <div className="p-2 bg-amber-600/20 text-amber-400 rounded-lg">
            <Lock size={18} />
          </div>
          <div>
            <h3 className="font-serif font-black tracking-tight leading-none text-white">Pastor Ken Authentication</h3>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Admin Control Gate</span>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2 text-xs text-red-850">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">Username</label>
            <input 
              id="admin-username-input"
              type="text" 
              placeholder="e.g. pastorken"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full text-sm p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">System Password</label>
            <input 
              id="admin-password-input"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full text-sm p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600 focus:bg-white transition"
            />
          </div>

          <button 
            id="admin-login-submit-btn"
            type="submit"
            className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Decrypt Security & Access</span>
          </button>
          
          <div className="bg-stone-50 border border-stone-200 p-3 rounded-lg text-[10px] text-stone-500 leading-relaxed text-center">
            🔒 Enter Credentials: <strong>pastorken / pastorken</strong> representing the Vercel decrypted environment identity.
          </div>
        </form>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-layout" className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-850 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400">Owner Dashboard</span>
            <h2 className="text-xl font-serif font-black text-white leading-tight">Pastor Ken Administrative Suite</h2>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-stone-400 bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700">active_session | pastor</span>
          <button 
            id="admin-logout-btn"
            onClick={handleLogout}
            className="py-1.5 px-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-semibold transition active:scale-95"
          >
            Exit Dashboard
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div id="admin-tab-nav" className="flex flex-wrap gap-1 bg-stone-100 p-1.5 rounded-2xl border border-stone-250">
        {[
          { id: "sermons", label: "Sermon Outlines", icon: Video },
          { id: "books", label: "Library Books", icon: BookOpen },
          { id: "courses", label: "Faith Academy", icon: GraduationCap },
          { id: "events", label: "Events Calendar", icon: Calendar },
          { id: "resources", label: "Study Handouts", icon: FileText },
          { id: "broadcaster", label: "Resend Broadcaster", icon: Mail },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setShowAddForm(false);
              }}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                activeTab === tab.id
                ? "bg-stone-900 text-white shadow"
                : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Pane */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm min-h-[400px]">
        {/* Dynamic Action Bar */}
        {activeTab !== "broadcaster" && activeTab !== "courses" && !showAddForm && (
          <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
            <h3 className="font-serif font-black text-stone-900 text-lg leading-none uppercase">Manage {activeTab}</h3>
            <button
              id={`add-${activeTab}-trigger`}
              onClick={() => setShowAddForm(true)}
              className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Create Dynamic {activeTab}</span>
            </button>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 1: SERMONS CRUD */}
        {/* ============================================================= */}
        {activeTab === "sermons" && (
          <div id="admin-sermons-tab">
            {showAddForm ? (
              <form onSubmit={handleCreateSermon} className="space-y-4 max-w-xl text-left border border-stone-150 p-6 rounded-xl bg-stone-50/50">
                <h4 className="font-serif font-bold text-stone-900">Define New Sermon Outline</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Sermon Title</label>
                    <input 
                      id="form-sermon-title"
                      type="text" required placeholder="e.g. Overcoming Giants"
                      value={sermonForm.title} onChange={e => setSermonForm({...sermonForm, title: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Series Name</label>
                    <input 
                      id="form-sermon-series"
                      type="text" required placeholder="e.g. David Studies"
                      value={sermonForm.series} onChange={e => setSermonForm({...sermonForm, series: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Video Link (Optional URL)</label>
                    <input 
                      id="form-sermon-video"
                      type="text" placeholder="https://www.w3schools.com/html/mov_bbb.mp4"
                      value={sermonForm.videoUrl} onChange={e => setSermonForm({...sermonForm, videoUrl: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Audio Broadcast Link (Optional MP3)</label>
                    <input 
                      id="form-sermon-audio"
                      type="text" placeholder="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
                      value={sermonForm.audioUrl} onChange={e => setSermonForm({...sermonForm, audioUrl: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Sermon Summary / Description</label>
                  <textarea 
                    id="form-sermon-desc"
                    required rows={2} placeholder="Brief sentence detailing the message goal..."
                    value={sermonForm.description} onChange={e => setSermonForm({...sermonForm, description: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Study Outline & Scriptures (Markdown supported)</label>
                  <textarea 
                    id="form-sermon-notes"
                    required rows={5} placeholder="### Key Study Points:\n1. Verse study\n2. Key application"
                    value={sermonForm.notes} onChange={e => setSermonForm({...sermonForm, notes: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button type="submit" id="submit-sermon-btn" className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-bold">Transmit Live</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded text-xs border">Cancel</button>
                </div>
              </form>
            ) : (
              <div id="admin-sermon-list" className="overflow-x-auto text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-mono text-[10px] tracking-wider">
                      <th className="p-3">Sermon Outline</th>
                      <th className="p-3">Series Group</th>
                      <th className="p-3">Date Dispatched</th>
                      <th className="p-3 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {sermons.map(s => (
                      <tr id={`admin-sermon-item-${s.id}`} key={s.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-semibold text-stone-900">{s.title}</td>
                        <td className="p-3 text-stone-600">{s.series}</td>
                        <td className="p-3 text-stone-500 font-mono">{s.date}</td>
                        <td className="p-3 text-right">
                          <button 
                            id={`delete-sermon-btn-${s.id}`}
                            onClick={() => handleDeleteSermon(s.id)}
                            className="p-1 px-2 hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: BOOKS CRUD */}
        {/* ============================================================= */}
        {activeTab === "books" && (
          <div id="admin-books-tab">
            {showAddForm ? (
              <form onSubmit={handleCreateBook} className="space-y-4 max-w-xl text-left border border-stone-150 p-6 rounded-xl bg-stone-50/50">
                <h4 className="font-serif font-bold text-stone-900">Add Theological Volume</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Book Title</label>
                    <input 
                      id="form-book-title"
                      type="text" required placeholder="e.g. Pursuing Grace"
                      value={bookForm.title} onChange={e => setBookForm({...bookForm, title: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Category Tag</label>
                    <input 
                      id="form-book-category"
                      type="text" required placeholder="e.g. Theology"
                      value={bookForm.category} onChange={e => setBookForm({...bookForm, category: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Physical Pages count</label>
                    <input 
                      id="form-book-pages"
                      type="number" required placeholder="180"
                      value={bookForm.pages} onChange={e => setBookForm({...bookForm, pages: Number(e.target.value)})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Cover Image Unsplash URL</label>
                    <input 
                      id="form-book-cover"
                      type="text" required placeholder="https://images.unsplash.com/photo-1544947950-fa07a98d237f"
                      value={bookForm.coverUrl} onChange={e => setBookForm({...bookForm, coverUrl: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Book Description / Summary</label>
                  <textarea 
                    id="form-book-desc"
                    required rows={3} placeholder="Provide target reader list goals..."
                    value={bookForm.description} onChange={e => setBookForm({...bookForm, description: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button type="submit" id="submit-book-btn" className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-bold">Publish Volume</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded text-xs border">Cancel</button>
                </div>
              </form>
            ) : (
              <div id="admin-books-list" className="overflow-x-auto text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-mono text-[10px] tracking-wider">
                      <th className="p-3">Ebook Title</th>
                      <th className="p-3">Category classification</th>
                      <th className="p-3">Total pages</th>
                      <th className="p-3 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {books.map(b => (
                      <tr id={`admin-book-item-${b.id}`} key={b.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-semibold text-stone-900">{b.title}</td>
                        <td className="p-3 text-stone-600">{b.category}</td>
                        <td className="p-3 text-stone-500 font-mono">{b.pages} pages</td>
                        <td className="p-3 text-right">
                          <button 
                            id={`delete-book-btn-${b.id}`}
                            onClick={() => handleDeleteBook(b.id)}
                            className="p-1 px-2 hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: ACADEMY COURSES BUILDING */}
        {/* ============================================================= */}
        {activeTab === "courses" && (
          <div id="admin-courses-tab" className="text-left space-y-4">
            <div className="bg-stone-50 p-6 rounded-xl border border-stone-200">
              <h4 className="font-serif font-black text-stone-900 text-lg mb-2">Curriculum Academy Builder</h4>
              <p className="text-xs text-stone-600 mb-4">Adding full scale modular courses is highly structural. You can create course nodes in the layout, or let us auto-compile module levels.</p>
              <button 
                id="simulate-add-course-btn"
                onClick={handleSimulateAddCourse}
                className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus size={14} />
                <span>Compile Academy Lesson Course</span>
              </button>
            </div>
            {/* Courses summary list */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-stone-100 text-xs uppercase font-mono font-bold border-b border-stone-200">Active Academy Curriculum</div>
              <div className="divide-y divide-stone-100">
                {courses.map(c => (
                  <div key={c.id} className="p-4 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-stone-900">{c.title}</h5>
                      <p className="text-xs text-stone-500">{c.description}</p>
                    </div>
                    <span className="text-[10px] font-mono bg-stone-100 border px-2 py-1 rounded">
                      {c.modules?.length} modules published
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: EVENTS CALENDAR */}
        {/* ============================================================= */}
        {activeTab === "events" && (
          <div id="admin-events-tab">
            {showAddForm ? (
              <form onSubmit={handleCreateEvent} className="space-y-4 max-w-xl text-left border border-stone-150 p-6 rounded-xl bg-stone-50/50">
                <h4 className="font-serif font-bold text-stone-900">Schedule Church Assembly Event</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Event Title</label>
                    <input 
                      id="form-event-title"
                      type="text" required placeholder="e.g. Evening Communion Praise"
                      value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Assembly Type</label>
                    <select
                      id="form-event-type"
                      value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600 cursor-pointer"
                    >
                      <option value="service">Church Service</option>
                      <option value="prayer">Prayer Vigil</option>
                      <option value="study">Bible Study Class</option>
                      <option value="special">Special Conference</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Calendar Date</label>
                    <input 
                      id="form-event-date"
                      type="date" required placeholder="2026-06-15"
                      value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Time Clock duration</label>
                    <input 
                      id="form-event-time"
                      type="text" required placeholder="e.g. 10:00 AM - Midday"
                      value={eventForm.time} onChange={e => setEventForm({...eventForm, time: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Physical Auditorium Location</label>
                  <input 
                    id="form-event-loc"
                    type="text" required placeholder="e.g. Main Sanctuary, Fellowship Hall, Zoom Room"
                    value={eventForm.location} onChange={e => setEventForm({...eventForm, location: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Unsplash banner cover URL</label>
                  <input 
                    id="form-event-img"
                    type="text" required placeholder="e.g. https://images.unsplash.com/photo-1438243447756-33fcb71e1a3c"
                    value={eventForm.image} onChange={e => setEventForm({...eventForm, image: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Event summary descriptors</label>
                  <textarea 
                    id="form-event-desc"
                    required rows={2} placeholder="Explain the theme or specialized guest speaker..."
                    value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button type="submit" id="submit-event-btn" className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-bold">Publish Event</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded text-xs border">Cancel</button>
                </div>
              </form>
            ) : (
              <div id="admin-events-list" className="overflow-x-auto text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-mono text-[10px] tracking-wider">
                      <th className="p-3">Assembly Event Title</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Auditorium Location</th>
                      <th className="p-3 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {events.map(e => (
                      <tr id={`admin-event-item-${e.id}`} key={e.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-semibold text-stone-900">{e.title}</td>
                        <td className="p-3 uppercase font-mono text-[10px] tracking-normal"><span className="px-1.5 py-0.5 bg-stone-105 rounded">{e.type}</span></td>
                        <td className="p-3 text-stone-500 font-mono">{e.date}</td>
                        <td className="p-3 text-stone-650 truncate max-w-xs">{e.location}</td>
                        <td className="p-3 text-right">
                          <button 
                            id={`delete-event-btn-${e.id}`}
                            onClick={() => handleDeleteEvent(e.id)}
                            className="p-1 px-2 hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 5: STUDY RESOURCES */}
        {/* ============================================================= */}
        {activeTab === "resources" && (
          <div id="admin-resources-tab">
            {showAddForm ? (
              <form onSubmit={handleCreateResource} className="space-y-4 max-w-xl text-left border border-stone-150 p-6 rounded-xl bg-stone-50/50">
                <h4 className="font-serif font-bold text-stone-900">Publish Study Companion Sheet</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Document Title</label>
                    <input 
                      id="form-res-title"
                      type="text" required placeholder="e.g. Ephesians Daily Study worksheets"
                      value={resourceForm.title} onChange={e => setResourceForm({...resourceForm, title: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Resource Category</label>
                    <input 
                      id="form-res-category"
                      type="text" required placeholder="e.g. Sermon Worksheets"
                      value={resourceForm.category} onChange={e => setResourceForm({...resourceForm, category: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">File structure size</label>
                    <input 
                      id="form-res-size"
                      type="text" required placeholder="e.g. 1.2 MB or 850 KB"
                      value={resourceForm.fileSize} onChange={e => setResourceForm({...resourceForm, fileSize: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-wider text-stone-500">File Type format</label>
                    <input 
                      id="form-res-type"
                      type="text" required placeholder="e.g. PDF Document, MS Word, Slide Deck"
                      value={resourceForm.fileType} onChange={e => setResourceForm({...resourceForm, fileType: e.target.value})}
                      className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500">Brief overview details</label>
                  <textarea 
                    id="form-res-desc"
                    required rows={2} placeholder="Explain what study goals this document covers..."
                    value={resourceForm.description} onChange={e => setResourceForm({...resourceForm, description: e.target.value})}
                    className="w-full text-sm p-2 bg-white border border-stone-200 rounded focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button type="submit" id="submit-resource-btn" className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-bold">Transmit document</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-stone-100 text-stone-700 rounded text-xs border">Cancel</button>
                </div>
              </form>
            ) : (
              <div id="admin-resources-list" className="overflow-x-auto text-left">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-mono text-[10px] tracking-wider">
                      <th className="p-3">Companion Document name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">File format / size</th>
                      <th className="p-3 text-right">Delete Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-xs">
                    {resources.map(r => (
                      <tr id={`admin-res-item-${r.id}`} key={r.id} className="hover:bg-stone-50/50">
                        <td className="p-3 font-semibold text-stone-900">{r.title}</td>
                        <td className="p-3 text-stone-600">{r.category}</td>
                        <td className="p-3 text-stone-500 font-mono">{r.fileType} • {r.fileSize}</td>
                        <td className="p-3 text-right">
                          <button 
                            id={`delete-res-btn-${r.id}`}
                            onClick={() => handleDeleteResource(r.id)}
                            className="p-1 px-2 hover:bg-red-50 text-red-500 border border-transparent hover:border-red-200 rounded transition"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB 6: RESEND BROADCASTER NEWSLETTER */}
        {/* ============================================================= */}
        {activeTab === "broadcaster" && (
          <div id="admin-broadcaster-tab" className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
            {/* Compositor form */}
            <form onSubmit={handleSendBroadcastEmail} className="space-y-4 border border-stone-200 p-6 rounded-2xl bg-stone-50/50">
              <div className="border-b border-stone-200 pb-3">
                <h4 className="font-serif font-black text-stone-900 text-lg leading-tight flex items-center space-x-2">
                  <Mail className="text-amber-600" size={18} />
                  <span>Interactive Christian Broadcaster</span>
                </h4>
                <p className="text-[10px] text-stone-500 mt-1 uppercase font-mono tracking-widest leading-tight">Driven by Resend API Node Module</p>
              </div>

              {emailStatus.message && (
                <div id="email-log-board" className={`p-4 rounded-xl text-xs border flex items-start space-x-2.5 ${
                  emailStatus.type === "sending" ? "bg-stone-50 border-stone-300 text-stone-850" :
                  emailStatus.type === "success" ? "bg-amber-50 border-amber-200 text-amber-900" :
                  "bg-red-50 border-red-200 text-red-900"
                }`}>
                  {emailStatus.type === "sending" ? (
                    <div className="w-4 h-4 border-2 border-stone-700 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  ) : emailStatus.type === "success" ? (
                    <Check size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">Broadcaster System Report:</p>
                    <p className="leading-relaxed whitespace-pre-wrap">{emailStatus.message}</p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">Email Subject line</label>
                <input 
                  id="broadcaster-subject-input"
                  type="text" required placeholder="Subject..."
                  value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  className="w-full text-sm p-2.5 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">Recipient distribution</label>
                  <select
                    id="broadcaster-target-select"
                    value={emailRecipientGroup} onChange={e => setEmailRecipientGroup(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg cursor-pointer"
                  >
                    <option value="members">All Registered Members (Test mode)</option>
                    <option value="leaders">Ministry Department heads</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">Dispatch Destination email</label>
                  <input 
                    id="broadcaster-destination-input"
                    type="email" required placeholder="To: email address..."
                    value={testEmail} onChange={e => setTestEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-lg font-mono focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-mono tracking-wider text-stone-500 block">Sermon Outlines & Greetings text</label>
                <textarea 
                  id="broadcaster-body-input"
                  required rows={6} placeholder="Incorporate Bible quotes..."
                  value={emailBody} onChange={e => setEmailBody(e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
                />
              </div>

              <button
                id="broadcaster-transmit-submit"
                type="submit"
                disabled={emailStatus.type === "sending"}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition active:scale-95 flex items-center justify-center space-x-2"
              >
                <Send size={14} />
                <span>Transmit Broadcast Live</span>
              </button>
            </form>

            {/* Broadcast outputs and logs */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 espacio-y-4">
                <h5 className="font-serif font-bold text-stone-850 mb-1">Broadcaster Log Book</h5>
                <p className="text-[10px] text-stone-500 mb-3">Historical dispatches executed on this server container.</p>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {broadcasts.length > 0 ? (
                    broadcasts.map(b => (
                      <div key={b.id} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 text-xs hover:border-amber-400 transition">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider font-semibold ${
                            b.status === "sent" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-stone-50 text-stone-605 border border-stone-200"
                          }`}>
                            {b.status}
                          </span>
                          <span className="text-[9px] text-stone-400 font-mono">{b.sentAt ? b.sentAt.split('T')[0] : "Draft"}</span>
                        </div>
                        <h6 className="font-bold text-stone-900">{b.subject}</h6>
                        <p className="text-stone-600 line-clamp-2 leading-relaxed">{b.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-400 text-xs text-center py-6">No email history in log book.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
