import sqlite3
from datetime import datetime, timedelta

def init():
    conn = sqlite3.connect('hostel.db')
    cursor = conn.cursor()

    cursor.executescript('''
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS rooms;
        DROP TABLE IF EXISTS complaints;
        DROP TABLE IF EXISTS payments;
        DROP TABLE IF EXISTS visitors;
        DROP TABLE IF EXISTS late_arrivals;
        DROP TABLE IF EXISTS broadcasts;

        CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, password TEXT, role TEXT, studentId TEXT, room TEXT, phone TEXT, cnic TEXT);
        CREATE TABLE rooms (id TEXT PRIMARY KEY, number TEXT, floor INTEGER, type TEXT, occupied INTEGER, capacity INTEGER, status TEXT, assets TEXT);
        CREATE TABLE complaints (id TEXT PRIMARY KEY, studentId INTEGER, studentName TEXT, category TEXT, subject TEXT, description TEXT, status TEXT, priority TEXT, date TEXT, updatedAt TEXT);
        CREATE TABLE payments (id TEXT PRIMARY KEY, studentId INTEGER, studentName TEXT, amount INTEGER, month TEXT, status TEXT, date TEXT, receipt TEXT);
        CREATE TABLE visitors (id TEXT PRIMARY KEY, studentId INTEGER, studentName TEXT, visitorName TEXT, visitorCnic TEXT, relationship TEXT, expectedDate TEXT, expectedTime TEXT, status TEXT, entryTime TEXT, exitTime TEXT);
        CREATE TABLE late_arrivals (id TEXT PRIMARY KEY, studentId INTEGER, studentName TEXT, roomNo TEXT, time TEXT, date TEXT, note TEXT);
        CREATE TABLE broadcasts (id TEXT PRIMARY KEY, title TEXT, message TEXT, urgency TEXT, authorName TEXT, date TEXT, readers TEXT);
    ''')

    # ── STAFF ──────────────────────────────────────────────────────────────────
    staff = [
        # Admins
        (1,  'Dr. Khalid Mehmood',   'admin1@dhms.edu',   'admin123',   'admin',  None, None, '0300-1111111', '42201-1111111-1'),
        (2,  'Dr. Rabia Siddiqui',   'admin2@dhms.edu',   'admin123',   'admin',  None, None, '0300-2222222', '42201-2222222-2'),
        # Wardens
        (3,  'Mr. Asad Raza',        'warden1@dhms.edu',  'warden123',  'warden', None, None, '0300-3333333', '42201-3333333-3'),
        (4,  'Ms. Nadia Hussain',    'warden2@dhms.edu',  'warden123',  'warden', None, None, '0300-4444444', '42201-4444444-4'),
        # Guards
        (5,  'Constable Nadeem',     'guard1@dhms.edu',   'guard123',   'guard',  None, None, '0300-5555555', '42201-5555555-5'),
        (6,  'Constable Tariq Bhai', 'guard2@dhms.edu',   'guard123',   'guard',  None, None, '0300-6666666', '42201-6666666-6'),
    ]

    # ── 20 STUDENTS ────────────────────────────────────────────────────────────
    students = [
        (101, 'Ali Hassan',          'ali.hassan@dhms.edu',       'student123', 'student', '24I-0001', '101', '0321-1000001', '42101-1000001-1'),
        (102, 'Sara Khan',           'sara.khan@dhms.edu',        'student123', 'student', '24I-0002', '102', '0321-1000002', '42101-1000002-2'),
        (103, 'Usman Tariq',         'usman.tariq@dhms.edu',      'student123', 'student', '24I-0003', '103', '0321-1000003', '42101-1000003-3'),
        (104, 'Fatima Zahra',        'fatima.zahra@dhms.edu',     'student123', 'student', '24I-0004', '104', '0321-1000004', '42101-1000004-4'),
        (105, 'Ahmed Bilal',         'ahmed.bilal@dhms.edu',      'student123', 'student', '24I-0005', '201', '0321-1000005', '42101-1000005-5'),
        (106, 'Ayesha Noor',         'ayesha.noor@dhms.edu',      'student123', 'student', '24I-0006', '202', '0321-1000006', '42101-1000006-6'),
        (107, 'Hamza Sheikh',        'hamza.sheikh@dhms.edu',     'student123', 'student', '24I-0007', '203', '0321-1000007', '42101-1000007-7'),
        (108, 'Zainab Malik',        'zainab.malik@dhms.edu',     'student123', 'student', '24I-0008', '204', '0321-1000008', '42101-1000008-8'),
        (109, 'Bilal Chaudhry',      'bilal.chaudhry@dhms.edu',   'student123', 'student', '24I-0009', '205', '0321-1000009', '42101-1000009-9'),
        (110, 'Hira Baig',           'hira.baig@dhms.edu',        'student123', 'student', '24I-0010', '301', '0321-1000010', '42101-1000010-1'),
        (111, 'Muneeb Akhtar',       'muneeb.akhtar@dhms.edu',    'student123', 'student', '24I-0011', '302', '0321-1000011', '42101-1000011-1'),
        (112, 'Sana Qureshi',        'sana.qureshi@dhms.edu',     'student123', 'student', '24I-0012', '303', '0321-1000012', '42101-1000012-1'),
        (113, 'Faisal Javed',        'faisal.javed@dhms.edu',     'student123', 'student', '24I-0013', '304', '0321-1000013', '42101-1000013-1'),
        (114, 'Maham Riaz',          'maham.riaz@dhms.edu',       'student123', 'student', '24I-0014', '305', '0321-1000014', '42101-1000014-1'),
        (115, 'Saad Farooq',         'saad.farooq@dhms.edu',      'student123', 'student', '24I-0015', '401', '0321-1000015', '42101-1000015-1'),
        (116, 'Nida Rehman',         'nida.rehman@dhms.edu',      'student123', 'student', '24I-0016', '402', '0321-1000016', '42101-1000016-1'),
        (117, 'Talha Butt',          'talha.butt@dhms.edu',       'student123', 'student', '24I-0017', '403', '0321-1000017', '42101-1000017-1'),
        (118, 'Rimsha Ijaz',         'rimsha.ijaz@dhms.edu',      'student123', 'student', '24I-0018', '404', '0321-1000018', '42101-1000018-1'),
        (119, 'Omer Shahid',         'omer.shahid@dhms.edu',      'student123', 'student', '24I-0019', '405', '0321-1000019', '42101-1000019-1'),
        (120, 'Amna Waseem',         'amna.waseem@dhms.edu',      'student123', 'student', '24I-0020', '101', '0321-1000020', '42101-1000020-2'),
    ]

    cursor.executemany('INSERT INTO users VALUES (?,?,?,?,?,?,?,?,?)', staff + students)

    # ── 10 ROOMS (single / double / triple, floors 1–4) ────────────────────────
    rooms = [
        ('R101', '101', 1, 'double', 2, 2, 'full',      '[{"name":"Bed","qty":2},{"name":"Fan","qty":1},{"name":"Desk","qty":2}]'),
        ('R102', '102', 1, 'single', 1, 1, 'full',      '[{"name":"Bed","qty":1},{"name":"Desk","qty":1},{"name":"Cupboard","qty":1}]'),
        ('R103', '103', 1, 'triple', 2, 3, 'available', '[{"name":"Bed","qty":3},{"name":"Fan","qty":2},{"name":"Desk","qty":3}]'),
        ('R104', '104', 1, 'single', 1, 1, 'full',      '[{"name":"Bed","qty":1},{"name":"AC","qty":1},{"name":"Desk","qty":1}]'),
        ('R201', '201', 2, 'double', 2, 2, 'full',      '[{"name":"Bed","qty":2},{"name":"Fan","qty":1},{"name":"Cupboard","qty":2}]'),
        ('R202', '202', 2, 'double', 1, 2, 'available', '[{"name":"Bed","qty":2},{"name":"Desk","qty":2},{"name":"Fan","qty":1}]'),
        ('R203', '203', 2, 'triple', 3, 3, 'full',      '[{"name":"Bed","qty":3},{"name":"AC","qty":1},{"name":"Cupboard","qty":3}]'),
        ('R301', '301', 3, 'single', 1, 1, 'full',      '[{"name":"Bed","qty":1},{"name":"Fan","qty":1},{"name":"Desk","qty":1}]'),
        ('R302', '302', 3, 'triple', 2, 3, 'available', '[{"name":"Bed","qty":3},{"name":"Fan","qty":2},{"name":"Desk","qty":3}]'),
        ('R401', '401', 4, 'double', 0, 2, 'available', '[{"name":"Bed","qty":2},{"name":"AC","qty":1},{"name":"Desk","qty":2}]'),
    ]
    cursor.executemany('INSERT INTO rooms VALUES (?,?,?,?,?,?,?,?)', rooms)

    # ── COMPLAINTS ─────────────────────────────────────────────────────────────
    complaints = [
        ('C001', 101, 'Ali Hassan',     'maintenance', 'Fan not working',          'Room 101 fan is making loud noise since 3 days.',           'in-progress', 'high',   '2026-05-08', '2026-05-09'),
        ('C002', 102, 'Sara Khan',      'food',        'Mess food quality',         'Dinner was cold and undercooked on Wednesday night.',       'received',    'medium', '2026-05-10', '2026-05-10'),
        ('C003', 105, 'Ahmed Bilal',    'maintenance', 'Water leakage in bathroom', 'Pipe under sink has been leaking since last week.',          'resolved',    'high',   '2026-05-05', '2026-05-07'),
        ('C004', 108, 'Zainab Malik',   'security',    'Broken room lock',          'Lock on room 204 door is jammed, cannot lock properly.',   'in-progress', 'high',   '2026-05-11', '2026-05-12'),
        ('C005', 112, 'Sana Qureshi',   'cleanliness', 'Washroom not cleaned',      'Ground floor washrooms were not cleaned for 2 days.',      'received',    'low',    '2026-05-12', '2026-05-12'),
    ]
    cursor.executemany('INSERT INTO complaints VALUES (?,?,?,?,?,?,?,?,?,?)', complaints)

    # ── VISITORS ───────────────────────────────────────────────────────────────
    visitors = [
        ('V001', 101, 'Ali Hassan',   'Ahmed Ali',      '42201-7654321-1', 'Brother', '2026-05-15', '14:00', 'approved', None,                None),
        ('V002', 102, 'Sara Khan',    'Fatima Bibi',    '42201-7654321-2', 'Mother',  '2026-05-12', '10:00', 'pending',  None,                None),
        ('V003', 105, 'Ahmed Bilal',  'Tariq Bilal',    '42201-7654321-3', 'Father',  '2026-05-13', '16:30', 'approved', '2026-05-13T16:35',  None),
        ('V004', 110, 'Hira Baig',    'Nadia Baig',     '42201-7654321-4', 'Sister',  '2026-05-14', '11:00', 'rejected', None,                None),
        ('V005', 115, 'Saad Farooq',  'Usman Farooq',   '42201-7654321-5', 'Uncle',   '2026-05-16', '15:00', 'pending',  None,                None),
    ]
    cursor.executemany('INSERT INTO visitors VALUES (?,?,?,?,?,?,?,?,?,?,?)', visitors)

    # ── LATE ARRIVALS ──────────────────────────────────────────────────────────
    late = [
        ('L001', 101, 'Ali Hassan',   '101', '23:45', '2026-05-11', 'Family wedding in Lahore'),
        ('L002', 107, 'Hamza Sheikh', '203', '00:10', '2026-05-09', 'Hospital visit with friend'),
        ('L003', 113, 'Faisal Javed', '304', '23:30', '2026-05-10', 'Bus from Karachi was delayed'),
    ]
    cursor.executemany('INSERT INTO late_arrivals VALUES (?,?,?,?,?,?,?)', late)

    # ── BROADCASTS ─────────────────────────────────────────────────────────────
    broadcasts = [
        ('B001', 'Water Outage Tonight',       'Water supply will be unavailable from 2:00 AM to 6:00 AM due to tank maintenance. Please store water beforehand.',       'warning',  'Warden Asad Raza',     '2026-05-12T10:00:00', '[]'),
        ('B002', 'Mess Timings Update',        'From Monday onwards mess breakfast timing changes to 7:00 AM – 8:30 AM. Students are advised to plan accordingly.',       'info',     'Dr. Khalid Mehmood',   '2026-05-11T09:00:00', '[]'),
        ('B003', 'Fire Drill Scheduled',       'A mandatory fire drill will be conducted on 17th May at 11:00 AM. All residents must participate. Attendance is compulsory.', 'urgent', 'Warden Nadia Hussain', '2026-05-10T14:00:00', '[]'),
        ('B004', 'Fee Payment Deadline',       'Last date to submit hostel fee for June is 20th May. Late payments will incur a fine of Rs. 500. Pay at the admin office.', 'warning', 'Dr. Rabia Siddiqui',  '2026-05-09T11:30:00', '[]'),
    ]
    cursor.executemany('INSERT INTO broadcasts VALUES (?,?,?,?,?,?,?)', broadcasts)

    # ── PAYMENTS (JANUARY - MARCH 2026) ─────────────────────────────────────────
    payments = [
        # January: Fully Paid for demo
        ('P001', 101, 'Ali Hassan', 8500, 'January 2026', 'paid', '2026-01-05', 'REC-JAN-101'),
        ('P002', 102, 'Sara Khan', 8500, 'January 2026', 'paid', '2026-01-06', 'REC-JAN-102'),
        ('P003', 103, 'Usman Tariq', 8500, 'January 2026', 'paid', '2026-01-05', 'REC-JAN-103'),
        ('P004', 104, 'Fatima Zahra', 8500, 'January 2026', 'paid', '2026-01-07', 'REC-JAN-104'),
        
        # February: Mixed status
        ('P005', 101, 'Ali Hassan', 8500, 'February 2026', 'paid', '2026-02-05', 'REC-FEB-101'),
        ('P006', 102, 'Sara Khan', 8500, 'February 2026', 'overdue', None, None),
        ('P007', 103, 'Usman Tariq', 8500, 'February 2026', 'paid', '2026-02-04', 'REC-FEB-103'),
        ('P008', 105, 'Ahmed Bilal', 8500, 'February 2026', 'overdue', None, None),

        # March: Current status
        ('P009', 101, 'Ali Hassan', 8500, 'March 2026', 'overdue', None, None),
        ('P010', 103, 'Usman Tariq', 8500, 'March 2026', 'paid', '2026-03-05', 'REC-MAR-103'),
        ('P011', 106, 'Ayesha Noor', 8500, 'March 2026', 'paid', '2026-03-02', 'REC-MAR-106'),
        ('P012', 107, 'Hamza Sheikh', 8500, 'March 2026', 'overdue', None, None),
    ]
    cursor.executemany('INSERT INTO payments VALUES (?,?,?,?,?,?,?,?)', payments)

    conn.commit()
    conn.close()
    print("Database Fully Seeded!")

if __name__ == '__main__':
    init()