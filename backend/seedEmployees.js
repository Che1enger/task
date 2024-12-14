// backend/seedEmployees.js
const mongoose = require('mongoose');
require('dotenv').config();
const { Employee } = require('./models');

const seedEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Очистим существующих сотрудников
    await Employee.deleteMany({});

    // Создадим тестовых менеджеров
    const employees = [
      { name: 'John Smith' },
      { name: 'Sarah Johnson' },
      { name: 'Michael Brown' },
      { name: 'Emily Davis' },
      { name: 'David Wilson' }
    ];

    await Employee.insertMany(employees);
    console.log('Test employees added successfully');

    // Выведем список добавленных сотрудников
    const addedEmployees = await Employee.find();
    console.log('Added employees:', addedEmployees);

  } catch (error) {
    console.error('Error seeding employees:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

seedEmployees();
