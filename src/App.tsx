import React, { useState, useEffect } from 'react';
import {
  collection, doc, getDocs, setDoc, deleteDoc, updateDoc,
  query, where, onSnapshot, getDocFromServer
} from 'firebase/firestore';
import { CheckCheck, X } from 'lucide-react';
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import {
  UserProfile, CscService, Application, SupportTicket, VaultDocument,
  Branch, AuditLog, AppNotification, UserRole, ApplicationStatus
} from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import OtpModal from './components/OtpModal';
import InvoiceModal from './components/InvoiceModal';
import NotificationCenter from './components/NotificationCenter';

// Display Views
import HomeView from './views/HomeView';
import CustomerPortal from './views/CustomerPortal';
import AdminPortal from './views/AdminPortal';
import SuperAdminPortal from './views/SuperAdminPortal';

// Predefined services
import { INITIAL_SERVICES } from './data/services';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedServiceForApply, setSelectedServiceForApply] = useState<CscService | null>(null);

  // Modals state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedInvoiceApp, setSelectedInvoiceApp] = useState<Application | null>(null);

  // Toast Notification popup state
  const [toast, setToast] = useState<{ id: string; title: string; message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Core database states
  const [applications, setApplications] = useState<Application[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [vault, setVault] = useState<VaultDocument[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Ref to store previous application states for instant push notification comparison
  const prevAppsRef = React.useRef<Record<string, ApplicationStatus>>({});

  // Auto-dismiss Toast effect
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 1. Connection check validation on initial mount as required by the Firebase-integration skill guidelines
  useEffect(() => {
    async function testConnection() {
      const testPath = 'test/connection';
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network limits.");
        }
      }
    }
    testConnection();
  }, []);

  // 2. Seeding Initial Dummy Datasets on load so developers have beautiful, fully functional stats and data instantly
  useEffect(() => {
    const defaultBranches: Branch[] = [
      { id: 'branch-1', name: 'Noida Sector 62 Branch', code: 'CSC-DL-A', location: 'HQ block, Plot 4A, Noida Sec-62', managerId: 'mgr-1', createdAt: new Date().toISOString() },
      { id: 'branch-2', name: 'Delhi Block A Center', code: 'CSC-UP-NOIDA-62', location: 'HQ Delhi Center, Block-A Noida Road', managerId: 'mgr-2', createdAt: new Date().toISOString() },
      { id: 'branch-3', name: 'Mumbai Fort Center', code: 'CSC-MH-MUM-11', location: 'Fort District Central, Mumbai', managerId: 'mgr-3', createdAt: new Date().toISOString() }
    ];

    const trackingSeedBase = 100200;
    const defaultApps: Application[] = [
      {
        id: 'app_1',
        customerId: 'uid_customer_demo',
        customerName: 'Ramesh Kumar (Citizen)',
        customerPhone: '9876543210',
        serviceId: 'pan-card',
        serviceName: 'New PAN Card or Correction',
        status: 'Completed',
        trackingNumber: `CSC-${trackingSeedBase + 1}`,
        documents: [{ name: 'Aadhaar_Front_Ramesh.pdf', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_aadhaar.pdf', uploadedAt: new Date().toISOString(), version: 1 }],
        finalCertificateUrl: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_certificate_csc_9481.pdf',
        feesPaid: 150,
        transactionId: 'TXN_' + Math.floor(Math.random() * 1000000),
        paymentStatus: 'Paid',
        operatorNotes: 'PAN Card printed and filed cleanly and digitally uploaded. Pick up physical card at Sector-62 desk.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'app_2',
        customerId: 'uid_customer_demo',
        customerName: 'Ramesh Kumar (Citizen)',
        customerPhone: '9876543210',
        serviceId: 'aadhaar-correction',
        serviceName: 'Aadhaar Demographic Update',
        status: 'Documents Required',
        trackingNumber: `CSC-${trackingSeedBase + 2}`,
        documents: [{ name: 'Electricity_Bill_Sec62.png', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_bill.png', uploadedAt: new Date().toISOString(), version: 1 }],
        feesPaid: 100,
        transactionId: 'TXN_' + Math.floor(Math.random() * 1000000),
        paymentStatus: 'Paid',
        operatorNotes: 'Please upload community or native verification certificate to replace the blurry address proof.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const defaultTickets: SupportTicket[] = [
      {
        id: 'ticket_1',
        customerId: 'uid_customer_demo',
        customerName: 'Ramesh Kumar (Citizen)',
        subject: 'Payment debited twice during PAN checkout',
        description: 'I pressed pay, money debited from bank twice, but first application showed draft. Please initiate surcharge refund.',
        category: 'Payment Surcharge',
        status: 'In Progress',
        replies: [
          { id: 'rep_1', senderId: 'uid_operator_demo', senderName: 'Arjun Devgan (Operator)', senderRole: 'operator', message: 'We noticed the duplicate trace on Razorpay merchant files. Standard INR 150 credit payout was initiated back to Ramesh account.', createdAt: new Date().toISOString() }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    const defaultVault: VaultDocument[] = [
      { id: 'vault_1', customerId: 'uid_customer_demo', name: 'Aadhaar Card Original', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_aadhaar.pdf', category: 'Identity Proof', bytes: 492000, uploadedAt: new Date().toISOString() },
      { id: 'vault_2', customerId: 'uid_customer_demo', name: 'Class 10 Marksheet copy', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_marks.pdf', category: 'School Certificate', bytes: 1205000, uploadedAt: new Date().toISOString() }
    ];

    const defaultLogs: AuditLog[] = [
      { id: 'log_1', actorId: 'uid_operator_demo', actorName: 'Arjun Devgan', actorRole: 'operator', action: 'Approved Application', details: 'Operator validated customer Ramesh Kumar PAN requirements.', timestamp: new Date().toISOString() },
      { id: 'log_2', actorId: 'uid_superadmin_demo', actorName: 'Sanjay Sen', actorRole: 'superadmin', action: 'System Setup', details: 'Initialized standard CSC service pricing profiles.', timestamp: new Date().toISOString() }
    ];

    const defaultNotifs: AppNotification[] = [
      { id: 'not_1', userId: 'uid_customer_demo', title: 'Application Process Event', message: 'SMS Alert Sent: Tracking ID CSC-100201 completed successfully. Retrieve pdf.', type: 'sms', status: 'delivered', timestamp: new Date().toISOString() },
      { id: 'not_2', userId: 'uid_customer_demo', title: 'WhatsApp verification check', message: 'WhatsApp trigger: Customer Ramesh Kumar Aadhaar demographic correction requires replacement documents.', type: 'whatsapp', status: 'delivered', timestamp: new Date().toISOString() }
    ];

    setBranches(defaultBranches);
    setApplications(defaultApps);
    setTickets(defaultTickets);
    setVault(defaultVault);
    setAuditLogs(defaultLogs);
    setNotifications(defaultNotifs);

    // Default Customer logged in internally to enable immediate frictionless testing of portals!
    setCurrentUser({
      uid: 'uid_customer_demo',
      name: 'Ramesh Kumar (Citizen)',
      email: 'ramesh.kumar@gmail.com',
      phone: '9876543210',
      role: 'customer',
      branch: 'Noida Sector 62 Branch',
      createdAt: new Date().toISOString()
    });
  }, []);

  // --- REAL-TIME SNAPSHOT SYNCHRONIZERS (WEBSOCKET CHANNEL EQUIVALENT) ---
  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen to Applications with real-time pushes
    const appQuery = currentUser.role === 'customer'
      ? query(collection(db, 'applications'), where('customerId', '==', currentUser.uid))
      : collection(db, 'applications');

    const unsubApps = onSnapshot(appQuery, (snapshot) => {
      const list: Application[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as Application);
      });

      // Sort by descending creation date
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // If online but firestore is empty, seed initial apps into firestore automatically
      if (list.length === 0 && currentUser.uid === 'uid_customer_demo') {
        const trackingSeedBase = 100200;
        const defaultApps: Application[] = [
          {
            id: 'app_1',
            customerId: 'uid_customer_demo',
            customerName: 'Ramesh Kumar (Citizen)',
            customerPhone: '9876543210',
            serviceId: 'pan-card',
            serviceName: 'New PAN Card or Correction',
            status: 'Completed',
            trackingNumber: `CSC-${trackingSeedBase + 1}`,
            documents: [{ name: 'Aadhaar_Front_Ramesh.pdf', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_aadhaar.pdf', uploadedAt: new Date().toISOString(), version: 1 }],
            finalCertificateUrl: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_certificate_csc_9481.pdf',
            feesPaid: 150,
            transactionId: 'TXN_' + Math.floor(Math.random() * 1000000),
            paymentStatus: 'Paid',
            operatorNotes: 'PAN Card printed and filed cleanly and digitally uploaded. Pick up physical card at Sector-62 desk.',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'app_2',
            customerId: 'uid_customer_demo',
            customerName: 'Ramesh Kumar (Citizen)',
            customerPhone: '9876543210',
            serviceId: 'aadhaar-correction',
            serviceName: 'Aadhaar Demographic Update',
            status: 'Documents Required',
            trackingNumber: `CSC-${trackingSeedBase + 2}`,
            documents: [{ name: 'Electricity_Bill_Sec62.png', url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_bill.png', uploadedAt: new Date().toISOString(), version: 1 }],
            feesPaid: 100,
            transactionId: 'TXN_' + Math.floor(Math.random() * 1000000),
            paymentStatus: 'Paid',
            operatorNotes: 'Please upload community or native verification certificate to replace the blurry address proof.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        defaultApps.forEach(app => {
          setDoc(doc(db, 'applications', app.id), app).catch(console.error);
        });
      } else {
        // Look for real-time status updates to trigger on-screen Toast push banners
        list.forEach(app => {
          const prevStatus = prevAppsRef.current[app.id];
          if (prevStatus && prevStatus !== app.status && currentUser.role === 'customer') {
            setToast({
              id: Math.random().toString(),
              title: `Real-time Status Sync: ${app.serviceName}`,
              message: `Your application status was changed to "${app.status}" by Noida operator. Notes: "${app.operatorNotes || 'None'}"`,
              type: 'info'
            });
            triggerNotification(
              currentUser.uid,
              `Status Updates: ${app.status}`,
              `Real-time Push: Your application tracker #${app.trackingNumber} is now: ${app.status}.`,
              'in-app'
            );
          }
          prevAppsRef.current[app.id] = app.status;
        });
        setApplications(list);
      }
    }, (error) => {
      console.warn("Real-time App snapshot syncing error:", error);
    });

    // 2. Listen to Support Tickets
    const ticketQuery = currentUser.role === 'customer'
      ? query(collection(db, 'tickets'), where('customerId', '==', currentUser.uid))
      : collection(db, 'tickets');

    const unsubTickets = onSnapshot(ticketQuery, (snapshot) => {
      const list: SupportTicket[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() } as SupportTicket);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (list.length === 0 && currentUser.uid === 'uid_customer_demo') {
        const defaultTickets: SupportTicket[] = [
          {
            id: 'ticket_1',
            customerId: 'uid_customer_demo',
            customerName: 'Ramesh Kumar (Citizen)',
            subject: 'Payment debited twice during PAN checkout',
            description: 'I pressed pay, money debited from bank twice, but first application showed draft. Please initiate surcharge refund.',
            category: 'Payment Surcharge',
            status: 'In Progress',
            replies: [
              { id: 'rep_1', senderId: 'uid_operator_demo', senderName: 'Arjun Devgan (Operator)', senderRole: 'operator', message: 'We noticed the duplicate trace on Razorpay merchant files. Standard INR 150 credit payout was initiated back to Ramesh account.', createdAt: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        defaultTickets.forEach(t => {
          setDoc(doc(db, 'tickets', t.id), t).catch(console.error);
        });
      } else {
        setTickets(list);
      }
    }, (error) => {
      console.warn("Real-time Tickets snapshot error:", error);
    });

    return () => {
      unsubApps();
      unsubTickets();
    };
  }, [currentUser]);

  // --- SUBMIT SERVICE RATING AND CRITIQUE OPTIONAL FEEDBACKS ---
  const handleRateApplication = (appId: string, rating: number, feedback: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const updatedApp = {
          ...app,
          rating,
          feedback,
          feedbackDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Sync updates inside Firestore
        const appPath = `applications/${appId}`;
        updateDoc(doc(db, 'applications', appId), {
          rating,
          feedback,
          feedbackDate: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
          .then(() => console.log("Feedback synced inside Cloud DB."))
          .catch((e) => handleFirestoreError(e, OperationType.UPDATE, appPath));

        return updatedApp;
      }
      return app;
    }));

    if (currentUser) {
      logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Submitted Feedback', `Citizen rated experience at ${rating} stars and wrote: "${feedback}".`);
      
      setToast({
        id: Math.random().toString(),
        title: 'Thank you!',
        message: 'Your service score and critique has been submitted to Noida supervisors.',
        type: 'success'
      });
    }
  };

  // 3. Simulated Multi-Channel Notification Trigger
  const triggerNotification = (userId: string, title: string, message: string, route: 'sms' | 'whatsapp' | 'email' | 'in-app') => {
    const notif: AppNotification = {
      id: 'notif_' + Math.floor(Math.random() * 1000000),
      userId,
      title,
      message,
      type: route,
      status: 'delivered',
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // --- ACTIONS LOG IN & OUT ---
  const handleLoginSuccess = (profile: UserProfile) => {
    setCurrentUser(profile);
    setIsLoginOpen(false);
    
    // Auto redirect to correct dashboard on login
    if (profile.role === 'customer') setActiveTab('portal');
    else if (profile.role === 'operator') setActiveTab('operator-portal');
    else if (profile.role === 'superadmin') setActiveTab('super-portal');

    // Securely Sync registration inside Firestore
    const userDbPath = `users/${profile.uid}`;
    setDoc(doc(db, 'users', profile.uid), profile)
      .then(() => console.log("User record updated."))
      .catch((e) => handleFirestoreError(e, OperationType.WRITE, userDbPath));

    // Audit trace
    logAudit(profile.uid, profile.name, profile.role, 'Auth Sign-In', 'User authenticated via mobile OTP bypass.');
  };

  const handleLogout = () => {
    if (currentUser) {
      logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Auth Sign-Out', 'User logged out.');
    }
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleSwitchQuickRole = (role: UserRole) => {
    let name = '';
    let email = '';
    let phone = '';
    let branch = '';

    if (role === 'customer') {
      name = 'Ramesh Kumar (Citizen)';
      email = 'ramesh.kumar@gmail.com';
      phone = '9876543210';
      branch = 'Noida Sector 62 Branch';
    } else if (role === 'operator') {
      name = 'Arjun Devgan (Operator)';
      email = 'arjun.csc@gmail.com';
      phone = '8876543210';
      branch = 'Noida Sector 62 Branch';
    } else if (role === 'superadmin') {
      name = 'Sanjay Sen (Director)';
      email = 'sanjay.director@csc.gov.in';
      phone = '7876543210';
      branch = 'CSC National Headquarters';
    }

    const mockProfile: UserProfile = {
      uid: 'uid_' + role + '_demo',
      name,
      email,
      phone,
      role,
      branch,
      createdAt: new Date().toISOString()
    };

    setCurrentUser(mockProfile);
    if (role === 'customer') setActiveTab('portal');
    else if (role === 'operator') setActiveTab('operator-portal');
    else if (role === 'superadmin') setActiveTab('super-portal');

    logAudit(mockProfile.uid, mockProfile.name, mockProfile.role, 'Auth Role Swap', `Exchanged credentials role to ${role}.`);
  };

  // --- ACTIONS LOG SERVICES SUBMIT ---
  const handleSubmitApplication = (serviceId: string, docFiles: { name: string; size: number }[], paymentMethod: string) => {
    if (!currentUser) return;
    const srv = INITIAL_SERVICES.find(s => s.id === serviceId);
    if (!srv) return;

    const newApp: Application = {
      id: 'app_' + Math.floor(Math.random() * 1000000),
      customerId: currentUser.uid,
      customerName: currentUser.name,
      customerPhone: currentUser.phone || '9876543210',
      serviceId,
      serviceName: srv.name,
      status: 'Pending',
      trackingNumber: 'CSC-' + Math.floor(100200 + Math.random() * 800000),
      documents: docFiles.map(f => ({ name: f.name, url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_upload.png', uploadedAt: new Date().toISOString(), version: 1 })),
      feesPaid: srv.fee,
      transactionId: 'TXN_' + Math.floor(Math.random() * 1000000),
      paymentStatus: 'Paid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Update Firestore matching Schema
    const appPath = `applications/${newApp.id}`;
    setDoc(doc(db, 'applications', newApp.id), newApp)
      .then(() => console.log("Application synced inside Cloud Firestore."))
      .catch((e) => handleFirestoreError(e, OperationType.CREATE, appPath));

    setApplications(prev => [newApp, ...prev]);

    // Dispatch Alerts
    triggerNotification(
      currentUser.uid,
      'Submission Received',
      `Dear Citizen, your service application for ${srv.name} has been received. Tracking code is ${newApp.trackingNumber}.`,
      'sms'
    );
    triggerNotification(
      currentUser.uid,
      'WhatsApp Advisory',
      `CSC Digital Noida: Order Verified under hash ${newApp.transactionId}. Direct PDF Invoice generated cleanly.`,
      'whatsapp'
    );

    // Audit logs
    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Created Application', `Submitted application tracking ${newApp.trackingNumber}.`);
  };

  // --- ACTIONS UPDATE APP PROGRESS ---
  const handleUpdateAppStatus = (appId: string, status: ApplicationStatus, notes: string, completedCertUrl?: string) => {
    if (!currentUser) return;

    setApplications(prev => prev.map(app => {
      if (app.id === appId) {
        const updatedApp = {
          ...app,
          status,
          operatorNotes: notes,
          finalCertificateUrl: completedCertUrl || app.finalCertificateUrl,
          operatorId: currentUser.uid,
          updatedAt: new Date().toISOString()
        };

        // Sync updates inside Firestore
        const appPath = `applications/${appId}`;
        updateDoc(doc(db, 'applications', appId), {
          status,
          operatorNotes: notes,
          finalCertificateUrl: completedCertUrl || null,
          operatorId: currentUser.uid,
          updatedAt: new Date().toISOString()
        })
          .then(() => console.log("State updated in Cloud DB."))
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, appPath));

        // Dispatch notifications based on status change!
        let titleAlert = `Tracker Status: ${status}`;
        let messageAlert = `Dear Ramesh Kumar, your CSC Tracking ID ${app.trackingNumber} has changed to: ${status}. Notes: ${notes}`;

        if (status === 'Completed') {
          titleAlert = 'Certificate Issued Successfully';
          messageAlert = `CSC ALERT: Your verified certificate for ${app.serviceName} has been issued! Log in inside Document Vault to download.`;
        } else if (status === 'Documents Required') {
          titleAlert = 'File Corrections Required';
          messageAlert = `REGISTRAR REJECTION: Blurry file error on Tracking ID ${app.trackingNumber}. Replace immediate document details on portal.`;
        }

        triggerNotification(app.customerId, titleAlert, messageAlert, 'sms');
        triggerNotification(app.customerId, titleAlert, `WhatsApp Trigger:\n${messageAlert}\nReference ID: Noida-62-Node`, 'whatsapp');
        triggerNotification(app.customerId, titleAlert, `Official email dispatched:\n${messageAlert}\nCSC Noida Registrar`, 'email');

        return updatedApp;
      }
      return app;
    }));

    // Audit logs
    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Changed Application Status', `Modified application ID ${appId} status to ${status}.`);
  };

  // --- OPERATIONS FOR TICKET RESOLUTIOn ---
  const handleCreateTicket = (subject: string, desc: string, category: string) => {
    if (!currentUser) return;

    const newTicket: SupportTicket = {
      id: 'ticket_' + Math.floor(Math.random() * 1000000),
      customerId: currentUser.uid,
      customerName: currentUser.name,
      subject,
      description: desc,
      category,
      status: 'Open',
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const ticketPath = `tickets/${newTicket.id}`;
    setDoc(doc(db, 'tickets', newTicket.id), newTicket)
      .catch(e => handleFirestoreError(e, OperationType.CREATE, ticketPath));

    setTickets(prev => [newTicket, ...prev]);

    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Created Ticket', `Citizen raised grievance topic: "${subject}".`);
  };

  const handlePostTicketReply = (ticketId: string, message: string, markResolved?: boolean) => {
    if (!currentUser) return;

    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const replies = [...t.replies, {
          id: 'reply_' + Math.floor(Math.random() * 1000000),
          senderId: currentUser.uid,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          message,
          createdAt: new Date().toISOString()
        }];

        const updated = {
          ...t,
          replies,
          status: markResolved ? ('Resolved' as const) : t.status,
          updatedAt: new Date().toISOString()
        };

        const ticketPath = `tickets/${ticketId}`;
        updateDoc(doc(db, 'tickets', ticketId), {
          replies,
          status: markResolved ? 'Resolved' : t.status,
          updatedAt: new Date().toISOString()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, ticketPath));

        triggerNotification(t.customerId, 'Grievance Reply Received', `New answer from Operator Arjun regarding ticket "${t.subject}".`, 'in-app');

        return updated;
      }
      return t;
    }));
  };

  // --- DOCUMENT LOCKER Vault CONTROl ---
  const handleUploadVaultDoc = (name: string, category: string, size: number) => {
    if (!currentUser) return;

    const newDoc: VaultDocument = {
      id: 'doc_' + Math.floor(Math.random() * 1000000),
      customerId: currentUser.uid,
      name,
      url: 'https://buoyant-sol-mmvz5.firebaseapp.com/mock_certificate.pdf',
      category,
      bytes: size,
      uploadedAt: new Date().toISOString()
    };

    const docPath = `vault/${newDoc.id}`;
    setDoc(doc(db, 'vault', newDoc.id), newDoc)
      .catch(e => handleFirestoreError(e, OperationType.CREATE, docPath));

    setVault(prev => [newDoc, ...prev]);

    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Vault Upload', `Added permanent certificate "${name}" inside Firestore.`);
  };

  const handleDeleteVaultDoc = (docId: string) => {
    if (!currentUser) return;

    const docPath = `vault/${docId}`;
    deleteDoc(doc(db, 'vault', docId))
      .catch(e => handleFirestoreError(e, OperationType.DELETE, docPath));

    setVault(prev => prev.filter(d => d.id !== docId));

    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Vault Delete', `Deleted file index ${docId} permanently.`);
  };

  // --- SUPERADMIN SETTING CONTROLS ---
  const handleAddBranch = (name: string, location: string, code: string) => {
    if (!currentUser) return;

    const newBranch: Branch = {
      id: 'branch_' + Math.floor(Math.random() * 1000000),
      name,
      code,
      location,
      managerId: 'mgr_demo',
      createdAt: new Date().toISOString()
    };

    const branchPath = `branches/${newBranch.id}`;
    setDoc(doc(db, 'branches', newBranch.id), newBranch)
      .catch(e => handleFirestoreError(e, OperationType.CREATE, branchPath));

    setBranches(prev => [...prev, newBranch]);

    logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Created Branch', `Authorized geographic franchise node code: ${code}.`);
  };

  const logAudit = (actorId: string, actorName: string, actorRole: UserRole, action: string, details: string) => {
    const log: AuditLog = {
      id: 'log_' + Math.floor(Math.random() * 1000000),
      actorId,
      actorName,
      actorRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };

    setAuditLogs(prev => [log, ...prev]);

    const logPath = `auditLogs/${log.id}`;
    setDoc(doc(db, 'auditLogs', log.id), log)
      .catch(e => handleFirestoreError(e, OperationType.CREATE, logPath));
  };

  const handleTriggerBackup = () => {
    const backupObj = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      applications,
      tickets,
      vault,
      branches,
      auditLogs
    };

    const payloadString = JSON.stringify(backupObj, null, 2);
    navigator.clipboard.writeText(payloadString).then(() => {
      alert("Database export JSON parsed! Portable backup has been copied to your clipboard successfully.");
    });
  };

  const handleTriggerRestore = (backupDataJson: string) => {
    try {
      const parsed = JSON.parse(backupDataJson);
      if (parsed.applications) setApplications(parsed.applications);
      if (parsed.tickets) setTickets(parsed.tickets);
      if (parsed.vault) setVault(parsed.vault);
      if (parsed.branches) setBranches(parsed.branches);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
    } catch (e) {
      alert('Backup invalid! Ensure it is standard exported JSON.');
    }
  };

  const handleClearApps = () => {
    setApplications([]);
    if (currentUser) {
      logAudit(currentUser.uid, currentUser.name, currentUser.role, 'Cleared Sandbox Database', 'Reset all temporary customer application logs.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Universal Sticky Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginOpen(true)}
        onSwitchRole={handleSwitchQuickRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notificationCount={notifications.length}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
      />

      {/* Main Container Sheet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* PUBLIC WEBPAGE TAB */}
        {activeTab === 'home' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {/* PUBLIC SECTIONS DISPLAY WITH REDIRECT FROM NAV */}
        {activeTab === 'services' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {activeTab === 'pricing' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {activeTab === 'faq' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {activeTab === 'about' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {activeTab === 'contact' && (
          <HomeView
            onOpenLogin={() => setIsLoginOpen(true)}
            setActiveTab={setActiveTab}
            setSelectedServiceForApply={setSelectedServiceForApply}
            globalApplications={applications}
          />
        )}

        {/* CITIZEN PERSONAL PORTAL VIEW */}
        {activeTab === 'portal' && currentUser && (
          <CustomerPortal
            currentUser={currentUser}
            selectedServiceForApply={selectedServiceForApply}
            setSelectedServiceForApply={setSelectedServiceForApply}
            applications={applications}
            onSubmitApplication={handleSubmitApplication}
            tickets={tickets}
            onCreateTicket={handleCreateTicket}
            onPostTicketReply={handlePostTicketReply}
            vault={vault}
            onUploadVaultDoc={handleUploadVaultDoc}
            onDeleteVaultDoc={handleDeleteVaultDoc}
            onOpenInvoice={setSelectedInvoiceApp}
            onRateApplication={handleRateApplication}
          />
        )}

        {/* CSC OPERATOR WORKSTATION VIEW */}
        {activeTab === 'operator-portal' && currentUser && (
          <AdminPortal
            currentUser={currentUser}
            applications={applications}
            onUpdateAppStatus={handleUpdateAppStatus}
            tickets={tickets}
            onPostTicketReply={handlePostTicketReply}
            onOpenInvoice={setSelectedInvoiceApp}
            onClearApps={handleClearApps}
          />
        )}

        {/* REGIONAL SUPER ADMIN CONTROL ROOM */}
        {activeTab === 'super-portal' && currentUser && (
          <SuperAdminPortal
            currentUser={currentUser}
            branches={branches}
            onAddBranch={handleAddBranch}
            auditLogs={auditLogs}
            onTriggerBackup={handleTriggerBackup}
            onTriggerRestore={handleTriggerRestore}
          />
        )}

      </main>

      {/* Structured Footer */}
      <Footer setActiveTab={setActiveTab} />

      {/* OVERLAY: Simulated OTP Auth modal */}
      <OtpModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* OVERLAY: GST Srv Invoice bills printable */}
      {selectedInvoiceApp && (
        <InvoiceModal
          application={selectedInvoiceApp}
          isOpen={!!selectedInvoiceApp}
          onClose={() => setSelectedInvoiceApp(null)}
        />
      )}

      {/* OVERLAY: Multi-channel SMS/WhatsApp notification logger */}
      <NotificationCenter
        notifications={notifications}
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onClear={() => setNotifications([])}
      />

      {/* Floating Push Toast Alerts */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] max-w-sm bg-white border border-slate-100/90 rounded-2xl shadow-2xl p-4 flex items-start gap-3 animate-slide-in font-sans">
          <div className={`p-2 rounded-lg shrink-0 ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
            toast.type === 'warning' ? 'bg-red-50 text-red-650' : 'bg-indigo-50 text-indigo-700'
          }`}>
            <CheckCheck size={18} />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900 text-xs">{toast.title}</h4>
            <p className="text-[11px] text-slate-500 leading-normal">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 transition p-1 rounded cursor-pointer shrink-0">
            <X size={13} strokeWidth={2.5} />
          </button>
        </div>
      )}

    </div>
  );
}
