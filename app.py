import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = sqlite3.connect('hostel.db')
    conn.row_factory = sqlite3.Row
    return conn

def generate_id(prefix, table, id_col='id'):
    conn = get_db_connection()
    count = len(conn.execute(f'SELECT {id_col} FROM {table}').fetchall())
    conn.close()
    return f"{prefix}{count + 1:03}"

def now_date():
    return datetime.now().strftime("%Y-%m-%d")

def now_dt():
    return datetime.now().strftime("%Y-%m-%dT%H:%M:%S")


# ─────────────────────────────────────────────────────────────────────────────
# 1. GLOBAL SYNC ROUTE
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/all-data', methods=['GET'])
def get_all_data():
    conn = get_db_connection()
    users        = [dict(r) for r in conn.execute('SELECT * FROM users').fetchall()]
    
    # FIX: Parse assets JSON string back to list for frontend
    raw_rooms    = [dict(r) for r in conn.execute('SELECT * FROM rooms').fetchall()]
    rooms = []
    for r in raw_rooms:
        r['assets'] = json.loads(r['assets']) if r.get('assets') else []
        rooms.append(r)

    complaints   = [dict(r) for r in conn.execute('SELECT * FROM complaints').fetchall()]
    payments     = [dict(r) for r in conn.execute('SELECT * FROM payments').fetchall()]
    visitors     = [dict(r) for r in conn.execute('SELECT * FROM visitors').fetchall()]
    late_arrivals= [dict(r) for r in conn.execute('SELECT * FROM late_arrivals').fetchall()]
    
    raw_broadcasts = [dict(r) for r in conn.execute('SELECT * FROM broadcasts ORDER BY date DESC').fetchall()]
    broadcasts = []
    for b in raw_broadcasts:
        b['readers'] = json.loads(b['readers']) if b.get('readers') else []
        broadcasts.append(b)
        
    conn.close()

    mess_menu = [
        {"day": "Monday",    "breakfast": "Paratha, Eggs, Chai",        "lunch": "Dal Chawal",         "dinner": "Chicken Karahi, Naan"},
        {"day": "Tuesday",   "breakfast": "Toast, Omelette, Chai",      "lunch": "Biryani",            "dinner": "Aloo Gosht, Roti"},
        {"day": "Wednesday", "breakfast": "Halwa Puri",                 "lunch": "Daal Mash, Chawal",  "dinner": "Qeema, Naan"},
        {"day": "Thursday",  "breakfast": "Paratha, Achar, Chai",       "lunch": "Palak Chawal",       "dinner": "Beef Stew, Roti"},
        {"day": "Friday",    "breakfast": "Paye, Naan",                 "lunch": "Pulao, Raita",       "dinner": "Daal Fry, Chapati"},
        {"day": "Saturday",  "breakfast": "Chana, Bhatura",             "lunch": "Fried Rice",         "dinner": "Chicken Handi, Naan"},
        {"day": "Sunday",    "breakfast": "Nihari, Naan",               "lunch": "Mutton Karahi",      "dinner": "Daal Tadka, Chawal"},
    ]

    return jsonify({
        "users":        users,
        "rooms":        rooms,
        "complaints":   complaints,
        "payments":     payments,
        "visitors":     visitors,
        "lateArrivals": late_arrivals,
        "broadcasts":   broadcasts,
        "messMenu":     mess_menu,
    })


# ─────────────────────────────────────────────────────────────────────────────
# 2. AUTHENTICATION
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/login', methods=['POST'])
def login():
    creds = request.json
    conn  = get_db_connection()
    user  = conn.execute(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        (creds['email'], creds['password'])
    ).fetchone()
    conn.close()
    if user:
        return jsonify(dict(user))
    return jsonify({"error": "Invalid credentials"}), 401


# ─────────────────────────────────────────────────────────────────────────────
# 2b. STUDENT SELF-REGISTRATION
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/register', methods=['POST'])
def register_student():
    """Open endpoint — students register themselves from the login page."""
    data = request.json
    required = ['name', 'email', 'password', 'studentId', 'phone', 'cnic']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    conn = get_db_connection()

    # Duplicate email or studentId check
    existing = conn.execute(
        'SELECT id FROM users WHERE email = ? OR studentId = ?',
        (data['email'], data['studentId'])
    ).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Email or Student ID already registered"}), 409

    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO users (name, email, password, role, studentId, room, phone, cnic) VALUES (?,?,?,?,?,?,?,?)',
        (data['name'], data['email'], data['password'], 'student',
         data['studentId'], data.get('room', None), data['phone'], data['cnic'])
    )
    conn.commit()
    new_user = conn.execute('SELECT * FROM users WHERE id = ?', (cursor.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(new_user)), 201


# ─────────────────────────────────────────────────────────────────────────────
# 2c. ADMIN ADDS STAFF ACCOUNT (warden / guard)
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/users/staff', methods=['POST'])
def add_staff():
    """Admin-only endpoint to create warden or guard accounts."""
    data = request.json
    required = ['name', 'email', 'password', 'role', 'phone', 'cnic']
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    allowed_roles = ['warden', 'guard', 'admin']
    if data['role'] not in allowed_roles:
        return jsonify({"error": f"Role must be one of: {', '.join(allowed_roles)}"}), 400

    conn = get_db_connection()

    # Duplicate email check
    existing = conn.execute('SELECT id FROM users WHERE email = ?', (data['email'],)).fetchone()
    if existing:
        conn.close()
        return jsonify({"error": "Email already registered"}), 409

    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO users (name, email, password, role, studentId, room, phone, cnic) VALUES (?,?,?,?,?,?,?,?)',
        (data['name'], data['email'], data['password'], data['role'],
         None, None, data['phone'], data['cnic'])
    )
    conn.commit()
    new_user = conn.execute('SELECT * FROM users WHERE id = ?', (cursor.lastrowid,)).fetchone()
    conn.close()
    return jsonify(dict(new_user)), 201


# ─────────────────────────────────────────────────────────────────────────────
# 3. USERS (STUDENT REGISTER & ADMIN ADD ACCOUNT)
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/users', methods=['GET'])
def get_users():
    conn  = get_db_connection()
    role  = request.args.get('role')
    query = 'SELECT * FROM users WHERE role = ?' if role else 'SELECT * FROM users'
    rows  = conn.execute(query, (role,) if role else ()).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

# FIX: Added POST route to handle Registration and Admin account creation
@app.route('/api/users', methods=['POST'])
def add_user():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO users (name, email, password, role, studentId, room, phone, cnic) VALUES (?,?,?,?,?,?,?,?)',
        (data.get('name'), data.get('email'), data.get('password'), data.get('role'), 
         data.get('studentId'), data.get('room'), data.get('phone'), data.get('cnic'))
    )
    conn.commit()
    new_id = cursor.lastrowid
    new_user = conn.execute('SELECT * FROM users WHERE id = ?', (new_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_user)), 201

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    if user:
        return jsonify(dict(user))
    return jsonify({"error": "User not found"}), 404

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE users SET name=?, email=?, phone=?, room=? WHERE id=?',
        (data.get('name'), data.get('email'), data.get('phone'), data.get('room'), user_id)
    )
    conn.commit()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    return jsonify(dict(user))

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "User deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# 4. ROOMS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/rooms', methods=['GET'])
def get_rooms():
    conn   = get_db_connection()
    status = request.args.get('status')
    query  = 'SELECT * FROM rooms WHERE status = ?' if status else 'SELECT * FROM rooms'
    rows   = conn.execute(query, (status,) if status else ()).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/rooms', methods=['POST'])
def add_room():
    r    = request.json
    r_id = f"R{r['number']}"
    conn = get_db_connection()
    # FIX: Ensure assets column is initialized with a stringified empty list to avoid modal crash
    conn.execute(
        'INSERT INTO rooms (id, number, floor, type, occupied, capacity, status, assets) VALUES (?,?,?,?,?,?,?,?)',
        (r_id, r['number'], r['floor'], r['type'], 0, r['capacity'], 'available', json.dumps(r.get('assets', [])))
    )
    conn.commit()
    raw  = conn.execute('SELECT * FROM rooms WHERE id = ?', (r_id,)).fetchone()
    conn.close()
    room = dict(raw)
    room['assets'] = json.loads(room['assets']) if room.get('assets') else []
    return jsonify(room), 201

@app.route('/api/rooms/<string:room_id>', methods=['PUT'])
def update_room(room_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE rooms SET number=?, floor=?, type=?, occupied=?, capacity=?, status=?, assets=? WHERE id=?',
        (data.get('number'), data.get('floor'), data.get('type'),
         data.get('occupied'), data.get('capacity'), data.get('status'),
         json.dumps(data.get('assets', [])), room_id)
    )
    conn.commit()
    room = conn.execute('SELECT * FROM rooms WHERE id = ?', (room_id,)).fetchone()
    conn.close()
    return jsonify(dict(room))

@app.route('/api/rooms/<string:room_id>', methods=['DELETE'])
def delete_room(room_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM rooms WHERE id = ?', (room_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Room deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# 5. COMPLAINTS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    conn      = get_db_connection()
    student_id = request.args.get('studentId')
    query     = 'SELECT * FROM complaints WHERE studentId = ?' if student_id else 'SELECT * FROM complaints'
    rows      = conn.execute(query, (student_id,) if student_id else ()).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/complaints', methods=['POST'])
def add_complaint():
    c    = request.json
    c_id = generate_id('C', 'complaints')
    date_now = now_date()
    conn = get_db_connection()
    conn.execute(
        '''INSERT INTO complaints (id, studentId, studentName, category, subject, description, status, priority, date, updatedAt)
           VALUES (?,?,?,?,?,?,?,?,?,?)''',
        (c_id, c['studentId'], c['studentName'], c['category'], c['subject'],
         c['description'], 'received', c.get('priority', 'medium'), date_now, date_now)
    )
    conn.commit()
    new_c = conn.execute('SELECT * FROM complaints WHERE id = ?', (c_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_c)), 201

@app.route('/api/complaints/<string:complaint_id>', methods=['PUT', 'PATCH'])
def update_complaint(complaint_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE complaints SET status=?, priority=?, updatedAt=? WHERE id=?',
        (data.get('status'), data.get('priority'), now_date(), complaint_id)
    )
    conn.commit()
    updated = conn.execute('SELECT * FROM complaints WHERE id = ?', (complaint_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))

@app.route('/api/complaints/<string:complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM complaints WHERE id = ?', (complaint_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Complaint deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# 6. PAYMENTS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/payments', methods=['GET'])
def get_payments():
    conn       = get_db_connection()
    student_id = request.args.get('studentId')
    query      = 'SELECT * FROM payments WHERE studentId = ?' if student_id else 'SELECT * FROM payments'
    rows       = conn.execute(query, (student_id,) if student_id else ()).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/payments', methods=['POST'])
def add_payment():
    p    = request.json
    p_id = generate_id('P', 'payments')
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO payments (id, studentId, studentName, amount, month, status, date, receipt) VALUES (?,?,?,?,?,?,?,?)',
        (p_id, p['studentId'], p['studentName'], p['amount'], p['month'],
         p.get('status', 'pending'), now_date(), p.get('receipt', ''))
    )
    conn.commit()
    new_p = conn.execute('SELECT * FROM payments WHERE id = ?', (p_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_p)), 201

@app.route('/api/payments/<string:payment_id>', methods=['PUT'])
def update_payment(payment_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE payments SET status=?, receipt=? WHERE id=?',
        (data.get('status'), data.get('receipt', ''), payment_id)
    )
    conn.commit()
    updated = conn.execute('SELECT * FROM payments WHERE id = ?', (payment_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))


# ─────────────────────────────────────────────────────────────────────────────
# 7. VISITORS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/visitors', methods=['GET'])
def get_visitors():
    conn       = get_db_connection()
    student_id = request.args.get('studentId')
    status     = request.args.get('status')
    if student_id:
        rows = conn.execute('SELECT * FROM visitors WHERE studentId = ?', (student_id,)).fetchall()
    elif status:
        rows = conn.execute('SELECT * FROM visitors WHERE status = ?', (status,)).fetchall()
    else:
        rows = conn.execute('SELECT * FROM visitors').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/visitors', methods=['POST'])
def add_visitor():
    v    = request.json
    v_id = generate_id('V', 'visitors')
    conn = get_db_connection()
    conn.execute(
        '''INSERT INTO visitors (id, studentId, studentName, visitorName, visitorCnic, relationship,
           expectedDate, expectedTime, status, entryTime, exitTime) VALUES (?,?,?,?,?,?,?,?,?,?,?)''',
        (v_id, v['studentId'], v['studentName'], v['visitorName'], v['visitorCnic'],
         v['relationship'], v['expectedDate'], v['expectedTime'], 'pending', None, None)
    )
    conn.commit()
    new_v = conn.execute('SELECT * FROM visitors WHERE id = ?', (v_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_v)), 201

@app.route('/api/visitors/<string:visitor_id>', methods=['PUT', 'PATCH'])
def update_visitor(visitor_id):
    data = request.json
    conn = get_db_connection()
    conn.execute(
        'UPDATE visitors SET status=?, entryTime=?, exitTime=? WHERE id=?',
        (data.get('status'), data.get('entryTime'), data.get('exitTime'), visitor_id)
    )
    conn.commit()
    updated = conn.execute('SELECT * FROM visitors WHERE id = ?', (visitor_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))

@app.route('/api/visitors/<string:visitor_id>', methods=['DELETE'])
def delete_visitor(visitor_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM visitors WHERE id = ?', (visitor_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Visitor request deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# 8. LATE ARRIVALS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/late-arrivals', methods=['GET'])
def get_late_arrivals():
    conn       = get_db_connection()
    student_id = request.args.get('studentId')
    query      = 'SELECT * FROM late_arrivals WHERE studentId = ?' if student_id else 'SELECT * FROM late_arrivals'
    rows       = conn.execute(query, (student_id,) if student_id else ()).fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/late-arrivals', methods=['POST'])
def add_late_arrival():
    l    = request.json
    l_id = generate_id('L', 'late_arrivals')
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO late_arrivals (id, studentId, studentName, roomNo, time, date, note) VALUES (?,?,?,?,?,?,?)',
        (l_id, l['studentId'], l['studentName'], l['roomNo'],
         l['time'], l.get('date', now_date()), l.get('note', ''))
    )
    conn.commit()
    new_l = conn.execute('SELECT * FROM late_arrivals WHERE id = ?', (l_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_l)), 201

@app.route('/api/late-arrivals/<string:arrival_id>', methods=['DELETE'])
def delete_late_arrival(arrival_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM late_arrivals WHERE id = ?', (arrival_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Late arrival record deleted"})


# ─────────────────────────────────────────────────────────────────────────────
# 9. BROADCASTS
# ─────────────────────────────────────────────────────────────────────────────
@app.route('/api/broadcasts', methods=['GET'])
def get_broadcasts():
    conn = get_db_connection()
    rows = conn.execute('SELECT * FROM broadcasts ORDER BY date DESC').fetchall()
    conn.close()
    return jsonify([dict(r) for r in rows])

@app.route('/api/broadcasts', methods=['POST'])
def add_broadcast():
    b    = request.json
    b_id = generate_id('B', 'broadcasts')
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO broadcasts (id, title, message, urgency, authorName, date, readers) VALUES (?,?,?,?,?,?,?)',
        (b_id, b['title'], b['message'], b.get('urgency', 'info'), b['authorName'], now_dt(), '[]')
    )
    conn.commit()
    new_b = conn.execute('SELECT * FROM broadcasts WHERE id = ?', (b_id,)).fetchone()
    conn.close()
    return jsonify(dict(new_b)), 201

@app.route('/api/broadcasts/<string:broadcast_id>', methods=['PUT', 'PATCH'])
def update_broadcast(broadcast_id):
    """Mark a broadcast as read by adding studentId to readers list."""
    data       = request.json
    student_id = data.get('studentId')
    conn       = get_db_connection()
    row        = conn.execute('SELECT readers FROM broadcasts WHERE id = ?', (broadcast_id,)).fetchone()
    if not row:
        conn.close()
        return jsonify({"error": "Broadcast not found"}), 404
    readers = json.loads(row['readers'])
    if student_id and student_id not in readers:
        readers.append(student_id)
    conn.execute('UPDATE broadcasts SET readers=? WHERE id=?', (json.dumps(readers), broadcast_id))
    conn.commit()
    updated = conn.execute('SELECT * FROM broadcasts WHERE id = ?', (broadcast_id,)).fetchone()
    conn.close()
    return jsonify(dict(updated))

@app.route('/api/broadcasts/<string:broadcast_id>', methods=['DELETE'])
def delete_broadcast(broadcast_id):
    conn = get_db_connection()
    conn.execute('DELETE FROM broadcasts WHERE id = ?', (broadcast_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Broadcast deleted"})


# ─────────────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    # Added host='0.0.0.0' for network hosting as requested
    app.run(debug=True, host='0.0.0.0', port=5000)