// ============================================================
// utils/seeder.js - Database Seeder Script
// ============================================================
// Populates MongoDB with initial mock data:
// - 1 HR Administrator
// - 2 Managers
// - 5 Employees
// - 3 Announcements
// - 2 Training Programs
// - 7 Days of Sample Attendance for each employee
//
// Run using: npm run seed OR node utils/seeder.js
// ============================================================

const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import Mongoose Models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Manager = require('../models/Manager');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');
const Notification = require('../models/Notification');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/staffsync';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`🔌 Connected to MongoDB at ${mongoUri}`);

    // 1. Clear all existing data
    console.log('🧹 Clearing existing database collections...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({}),
      Manager.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({}),
      Announcement.deleteMany({}),
      Training.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('✨ All collections cleared.');

    // 2. Create HR User
    console.log('👤 Creating HR administrator...');
    const hrUser = await User.create({
      name: 'Admin HR',
      email: 'hr@staffsync.com',
      password: 'hr123456',
      role: 'hr'
    });

    // 3. Create 2 Manager Users & Manager Profiles
    console.log('👔 Creating managers...');
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Manager 1 (Engineering)
    const manager1User = await User.create({
      name: 'John Manager',
      email: 'manager@staffsync.com',
      password: 'mgr123456',
      role: 'manager'
    });

    const manager1Doc = await Manager.create({
      userId: manager1User._id,
      employeeCode: 'MGR-001',
      firstName: 'John',
      lastName: 'Manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
      phone: '9876543210',
      dateOfJoining: twoYearsAgo,
      salary: 110000,
      teamMembers: []
    });

    manager1User.profileRef = manager1Doc._id;
    manager1User.profileModel = 'Manager';
    await manager1User.save();

    // Manager 2 (HR)
    const manager2User = await User.create({
      name: 'Sarah Manager',
      email: 'manager2@staffsync.com',
      password: 'mgr123456',
      role: 'manager'
    });

    const manager2Doc = await Manager.create({
      userId: manager2User._id,
      employeeCode: 'MGR-002',
      firstName: 'Sarah',
      lastName: 'Manager',
      department: 'HR',
      designation: 'HR Manager',
      phone: '9876543211',
      dateOfJoining: threeYearsAgo,
      salary: 95000,
      teamMembers: []
    });

    manager2User.profileRef = manager2Doc._id;
    manager2User.profileModel = 'Manager';
    await manager2User.save();

    // 4. Create 5 Employee Users & Employee Profiles
    console.log('👥 Creating 5 employees...');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const employeesSeed = [
      {
        name: 'Alice Employee',
        email: 'alice@staffsync.com',
        password: 'emp123456',
        code: 'EMP-001',
        firstName: 'Alice',
        lastName: 'Employee',
        department: 'Engineering',
        designation: 'Software Engineer',
        managerUser: manager1User,
        managerDoc: manager1Doc,
        salary: 60000,
        phone: '9876500001'
      },
      {
        name: 'Bob Smith',
        email: 'bob@staffsync.com',
        password: 'emp123456',
        code: 'EMP-002',
        firstName: 'Bob',
        lastName: 'Smith',
        department: 'Engineering',
        designation: 'Software Engineer',
        managerUser: manager1User,
        managerDoc: manager1Doc,
        salary: 62000,
        phone: '9876500002'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@staffsync.com',
        password: 'emp123456',
        code: 'EMP-003',
        firstName: 'Charlie',
        lastName: 'Brown',
        department: 'HR',
        designation: 'HR Executive',
        managerUser: manager2User,
        managerDoc: manager2Doc,
        salary: 50000,
        phone: '9876500003'
      },
      {
        name: 'Diana Prince',
        email: 'diana@staffsync.com',
        password: 'emp123456',
        code: 'EMP-004',
        firstName: 'Diana',
        lastName: 'Prince',
        department: 'Marketing',
        designation: 'Marketing Analyst',
        managerUser: manager1User,
        managerDoc: manager1Doc,
        salary: 54000,
        phone: '9876500004'
      },
      {
        name: 'Eve Adams',
        email: 'eve@staffsync.com',
        password: 'emp123456',
        code: 'EMP-005',
        firstName: 'Eve',
        lastName: 'Adams',
        department: 'Finance',
        designation: 'Financial Analyst',
        managerUser: manager2User,
        managerDoc: manager2Doc,
        salary: 58000,
        phone: '9876500005'
      }
    ];

    const createdEmployees = [];

    for (const item of employeesSeed) {
      const user = await User.create({
        name: item.name,
        email: item.email,
        password: item.password,
        role: 'employee'
      });

      const employeeDoc = await Employee.create({
        userId: user._id,
        employeeCode: item.code,
        firstName: item.firstName,
        lastName: item.lastName,
        department: item.department,
        designation: item.designation,
        managerId: item.managerUser._id,
        salary: item.salary,
        phone: item.phone,
        dateOfJoining: oneYearAgo,
        leaveBalance: {
          casual: 12,
          sick: 10,
          earned: 15,
          unpaid: 0
        }
      });

      user.profileRef = employeeDoc._id;
      user.profileModel = 'Employee';
      await user.save();

      // Add employee to manager's team
      item.managerDoc.teamMembers.push(employeeDoc._id);
      await item.managerDoc.save();

      createdEmployees.push(employeeDoc);
    }

    // 5. Create 3 Announcements
    console.log('📢 Creating announcements...');
    await Announcement.create([
      {
        title: 'Annual Company Town Hall 2026',
        content: 'We invite all team members to our upcoming Annual Town Hall this Friday at 4:00 PM. We will review our company milestones and share exciting product roadmaps for the upcoming quarters.',
        category: 'event',
        postedBy: hrUser._id,
        targetAudience: 'all',
        isPinned: true
      },
      {
        title: 'Updated Hybrid Work Guidelines',
        content: 'HR has published revised flexible work policies. Employees can work from home up to two days a week with prior manager notification. Check your department portal for details.',
        category: 'policy',
        postedBy: hrUser._id,
        targetAudience: 'all',
        isPinned: false
      },
      {
        title: 'Scheduled Network Maintenance Window',
        content: 'Internal servers, VPN, and intranet tools will undergo scheduled maintenance this Sunday between 02:00 AM and 06:00 AM UTC. Please plan your work accordingly.',
        category: 'urgent',
        postedBy: hrUser._id,
        targetAudience: 'employees',
        isPinned: false
      }
    ]);

    // 6. Create 2 Training Programs
    console.log('🎓 Creating training programs...');
    const now = new Date();

    const trainingStart1 = new Date();
    trainingStart1.setDate(now.getDate() - 3);
    const trainingEnd1 = new Date();
    trainingEnd1.setDate(now.getDate() + 10);

    const trainingStart2 = new Date();
    trainingStart2.setDate(now.getDate() + 5);
    const trainingEnd2 = new Date();
    trainingEnd2.setDate(now.getDate() + 8);

    await Training.create([
      {
        title: 'Modern Full-Stack Web Development',
        description: 'Comprehensive hands-on training on Node.js, Express, MongoDB, and React building real-world enterprise architectures.',
        trainer: 'Alex Rivera',
        department: 'Engineering',
        startDate: trainingStart1,
        endDate: trainingEnd1,
        mode: 'online',
        status: 'ongoing',
        participants: [createdEmployees[0]._id, createdEmployees[1]._id],
        createdBy: manager1User._id,
        maxParticipants: 30
      },
      {
        title: 'Workplace Leadership & Effective Communication',
        description: 'Interactive workshop focusing on interpersonal communication, cross-team collaboration, and conflict resolution.',
        trainer: 'Dr. Karen Vance',
        department: 'HR',
        startDate: trainingStart2,
        endDate: trainingEnd2,
        mode: 'hybrid',
        status: 'upcoming',
        participants: [createdEmployees[2]._id, createdEmployees[3]._id],
        createdBy: manager2User._id,
        maxParticipants: 25
      }
    ]);

    // 7. Create Sample Attendance for Last 7 Days for all employees
    console.log('📅 Creating 7-day attendance records for all employees...');
    for (const emp of createdEmployees) {
      for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
        const recordDate = new Date();
        recordDate.setDate(recordDate.getDate() - dayOffset);
        recordDate.setHours(0, 0, 0, 0);

        // Skip weekend days (Saturday = 6, Sunday = 0)
        const dayOfWeek = recordDate.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        // Create realistic check-in / check-out times
        const checkIn = new Date(recordDate);
        // Occasionally mark employee as late on day 2
        const isLate = dayOffset === 2 && emp.employeeCode === 'EMP-001';
        if (isLate) {
          checkIn.setHours(9, 45, 0, 0);
        } else {
          checkIn.setHours(9, 0, 0, 0);
        }

        const checkOut = new Date(recordDate);
        checkOut.setHours(18, 0, 0, 0);

        const hours = isLate ? 8.25 : 9.0;

        await Attendance.create({
          employeeId: emp._id,
          date: recordDate,
          checkIn,
          checkOut,
          totalHours: hours,
          status: isLate ? 'late' : 'present',
          markedBy: emp.userId
        });
      }
    }

    // 8. Log success message with all credentials
    console.log('\n======================================================');
    console.log('🎉 Database seeded successfully!');
    console.log('======================================================');
    console.log('LOGIN CREDENTIALS:');
    console.log('------------------------------------------------------');
    console.log('HR Admin:');
    console.log('  Email:    hr@staffsync.com');
    console.log('  Password: hr123456');
    console.log('\nManagers:');
    console.log('  1. John Manager (Engineering):');
    console.log('     Email:    manager@staffsync.com');
    console.log('     Password: mgr123456');
    console.log('  2. Sarah Manager (HR):');
    console.log('     Email:    manager2@staffsync.com');
    console.log('     Password: mgr123456');
    console.log('\nEmployees:');
    console.log('  1. Alice Employee (Engineering):');
    console.log('     Email:    alice@staffsync.com');
    console.log('     Password: emp123456');
    console.log('  2. Bob Smith (Engineering):');
    console.log('     Email:    bob@staffsync.com');
    console.log('     Password: emp123456');
    console.log('  3. Charlie Brown (HR):');
    console.log('     Email:    charlie@staffsync.com');
    console.log('     Password: emp123456');
    console.log('  4. Diana Prince (Marketing):');
    console.log('     Email:    diana@staffsync.com');
    console.log('     Password: emp123456');
    console.log('  5. Eve Adams (Finance):');
    console.log('     Email:    eve@staffsync.com');
    console.log('     Password: emp123456');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
