const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('Failed to connect to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Login API
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM user WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user.userID, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Login successful', token });
    });
  });
});

// Register API
app.post('/register', (req, res) => {
  const { userID, username, password } = req.body;
  const queryCheck = 'SELECT * FROM user WHERE userID = ? OR username = ?';
  db.query(queryCheck, [userID, username], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (results.length > 0) return res.status(409).json({ error: 'UserID or username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const queryInsert = 'INSERT INTO user (userID, username, password) VALUES (?, ?, ?)';
    db.query(queryInsert, [userID, username, hashedPassword], (err) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json({ success: true, message: 'Registration successful' });
    });
  });
});

// Get Detailed Food Items with Ingredients
app.get('/food-items', (req, res) => {
  const query = `
    SELECT fi.Fid, fi.name AS foodName, fi.image, fi.description, fi.price AS foodPrice, fi.calories AS foodCalories, 
           i.id AS ingredientId, i.name AS ingredientName, i.calories AS ingredientCalories, i.price AS ingredientPrice, 
           fi_ing.gram, fi_ing.totalCalo 
    FROM FoodItems AS fi
    JOIN FoodItems_Ingredient AS fi_ing ON fi.Fid = fi_ing.mid
    JOIN ingredients AS i ON fi_ing.Iid = i.id`;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Server error' });

    const foodItemsMap = {};
    results.forEach(row => {
      const { Fid, foodName, image, description, foodPrice, foodCalories, ingredientId, ingredientName, ingredientCalories, ingredientPrice, gram, totalCalo } = row;

      if (!foodItemsMap[Fid]) {
        foodItemsMap[Fid] = {
          Fid,
          foodName,
          image,
          description,
          foodPrice,
          foodCalories,
          ingredients: []
        };
      }
      foodItemsMap[Fid].ingredients.push({
        ingredientId,
        ingredientName,
        ingredientCalories,
        ingredientPrice,
        gram,
        totalCalo
      });
    });

    const foodItems = Object.values(foodItemsMap);
    res.json(foodItems);
  });
});


// Save Meal Plan API
app.post('/save-meal-plan', (req, res) => {
  const { mealPlanId, dateRangeStart, dateRangeEnd, peopleCount, childrenCount, totalCost, meals } = req.body;

  if (mealPlanId) {
    // Update existing MealPlan
    const updateMealPlanQuery = `
      UPDATE MealPlan
      SET date_range_start = ?, date_range_end = ?, people_count = ?, children_count = ?, total_cost = ?
      WHERE id = ?
    `;
    db.query(updateMealPlanQuery, [dateRangeStart, dateRangeEnd, peopleCount, childrenCount, totalCost, mealPlanId], (err) => {
      if (err) {
        console.error('Error updating meal plan:', err);
        return res.status(500).json({ error: 'Server error while updating meal plan' });
      }

      // Delete existing details for the meal plan
      const deleteDetailsQuery = `DELETE FROM MealPlanDetail WHERE meal_plan_id = ?`;
      db.query(deleteDetailsQuery, [mealPlanId], (err) => {
        if (err) {
          console.error('Error deleting old meal plan details:', err);
          return res.status(500).json({ error: 'Server error while updating meal details' });
        }

        // Insert updated details
        const mealPlanDetails = meals.map((meal) => [
          mealPlanId,
          meal.mealTime,
          meal.dayOfWeek,
          meal.foodId,
          meal.quantity,
        ]);

        const insertMealPlanDetailsQuery = `
          INSERT INTO MealPlanDetail (meal_plan_id, meal_time, day_of_week, food_id, quantity)
          VALUES ?
        `;
        db.query(insertMealPlanDetailsQuery, [mealPlanDetails], (err) => {
          if (err) {
            console.error('Error inserting updated meal plan details:', err);
            return res.status(500).json({ error: 'Server error while saving meal details' });
          }
          res.json({ success: true, message: 'Meal plan updated successfully' });
        });
      });
    });
  } else {
    const getDeletedIdsQuery = `
      SELECT id FROM MealPlan
      WHERE id NOT IN (SELECT DISTINCT meal_plan_id FROM MealPlanDetail)
      ORDER BY id ASC
    `;

    db.query(getDeletedIdsQuery, (err, results) => {
      if (err) {
        console.error('Error fetching deleted IDs:', err);
        return res.status(500).json({ error: 'Server error while fetching deleted IDs' });
      }

      // Kiểm tra nếu có ID đã xóa
      let newMealPlanId = null;
      if (results.length > 0) {
        newMealPlanId = results[0].id; // Lấy ID nhỏ nhất
      }

      const insertMealPlanQuery = newMealPlanId
        ? `INSERT INTO MealPlan (id, date_range_start, date_range_end, people_count, children_count, total_cost) VALUES (?, ?, ?, ?, ?, ?)`
        : `INSERT INTO MealPlan (date_range_start, date_range_end, people_count, children_count, total_cost) VALUES (?, ?, ?, ?, ?)`;

      const insertValues = newMealPlanId
        ? [newMealPlanId, dateRangeStart, dateRangeEnd, peopleCount, childrenCount, totalCost]
        : [dateRangeStart, dateRangeEnd, peopleCount, childrenCount, totalCost];

      db.query(insertMealPlanQuery, insertValues, (err, results) => {
        if (err) {
          console.error('Error creating new meal plan:', err);
          return res.status(500).json({ error: 'Server error while creating new meal plan' });
        }

        if (!newMealPlanId) {
          newMealPlanId = results.insertId; // Nếu không có ID tái sử dụng, lấy ID mới từ AUTO_INCREMENT
        }

        // Thêm chi tiết kế hoạch
        const mealPlanDetails = meals.map((meal) => [
          newMealPlanId,
          meal.mealTime,
          meal.dayOfWeek,
          meal.foodId,
          meal.quantity,
        ]);

        const insertMealPlanDetailsQuery = `
          INSERT INTO MealPlanDetail (meal_plan_id, meal_time, day_of_week, food_id, quantity)
          VALUES ?
        `;
        db.query(insertMealPlanDetailsQuery, [mealPlanDetails], (err) => {
          if (err) {
            console.error('Error adding meal plan details:', err);
            return res.status(500).json({ error: 'Server error while saving meal details' });
          }
          res.json({ success: true, message: 'Meal plan created successfully', newMealPlanId });
        });
      });
    });
  }
});

app.delete('/delete-meal-plan/:id', (req, res) => {
  const { id } = req.params;

  const deleteDetailsQuery = `DELETE FROM MealPlanDetail WHERE meal_plan_id = ?`;
  db.query(deleteDetailsQuery, [id], (err) => {
    if (err) {
      console.error('Error deleting meal plan details:', err);
      return res.status(500).json({ error: 'Server error while deleting meal plan details' });
    }

    const deleteMealPlanQuery = `DELETE FROM MealPlan WHERE id = ?`;
    db.query(deleteMealPlanQuery, [id], (err) => {
      if (err) {
        console.error('Error deleting meal plan:', err);
        return res.status(500).json({ error: 'Server error while deleting meal plan' });
      }
      res.json({ success: true, message: 'Meal plan deleted successfully' });
    });
  });
});

// Get Meal Plan API with All Details
app.get('/meal-plan', (req, res) => {
  // Query to fetch all meal plans
  const queryMealPlans = `
    SELECT * FROM MealPlan
    ORDER BY id DESC
  `;

  db.query(queryMealPlans, (err, mealPlans) => {
    if (err) return res.status(500).json({ error: 'Server error while fetching meal plans' });

    if (mealPlans.length === 0) return res.json({ mealPlans: [] });

    const mealPlanIds = mealPlans.map(plan => plan.id);

    // Query to fetch details for all meal plans
    const queryMealPlanDetails = `
      SELECT mpd.meal_plan_id, mpd.meal_time, mpd.day_of_week, mpd.food_id, mpd.quantity, fi.name AS foodName
      FROM MealPlanDetail mpd
      JOIN FoodItems fi ON mpd.food_id = fi.Fid
      WHERE mpd.meal_plan_id IN (?)
    `;

    db.query(queryMealPlanDetails, [mealPlanIds], (err, details) => {
      if (err) return res.status(500).json({ error: 'Server error while fetching meal plan details' });

      // Organize meal plans with their respective details
      const mealPlanMap = {};
      mealPlans.forEach(plan => {
        mealPlanMap[plan.id] = {
          ...plan,
          details: []
        };
      });

      details.forEach(detail => {
        if (mealPlanMap[detail.meal_plan_id]) {
          mealPlanMap[detail.meal_plan_id].details.push({
            mealTime: detail.meal_time,
            dayOfWeek: detail.day_of_week,
            foodId: detail.food_id,
            quantity: detail.quantity,
            foodName: detail.foodName
          });
        }
      });

      const organizedMealPlans = Object.values(mealPlanMap);
      res.json({ mealPlans: organizedMealPlans });
    });
  });
});


const PORT = process.env.PORT || 3060;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
