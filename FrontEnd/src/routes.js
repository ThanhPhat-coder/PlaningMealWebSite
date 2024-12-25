import React from "react";
import ProtectedRoute from "./Auth/ProtectedRoute";
import NotFound from "./Components/NotFoundForm/NotFoundForm";
import MakeMeal from "./Components/MakeMeal/MakeMeal";
import InfoUser from "./Components/InfoUser/InfoUser";

const LoginForm = React.lazy(() => import("./Components/LoginForm/LoginForm"));
const MainForm = React.lazy(() => import("./Components/MainForm/MainForm"));
const MealPlan = React.lazy(() => import("./Components/PlanMealForm/PlanMeal"));
const IngredientForm = React.lazy(() => import("./Components/IngredientForm/IngredientForm"));
const AboutUsForm = React.lazy(() => import("./Components/AboutUsForm/AboutUsForm"));

const routes = [
  { path: "/", element: <LoginForm /> },
  {
    path: "/main",
    element: (
      <ProtectedRoute>
        <MainForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/planmeal",
    element: (
      <ProtectedRoute>
        <MealPlan />
      </ProtectedRoute>
    ),
  },
  {
    path: "/makemeal",
    element: (
      <ProtectedRoute>
        <MakeMeal />
      </ProtectedRoute>
    ),
  },
  {
    path: "/infouser",
    element: (
      <ProtectedRoute>
        <InfoUser />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ingredient",
    element: (
      <ProtectedRoute>
        <IngredientForm />
      </ProtectedRoute>
    ),
  },
  {
    path: "/aboutus",
    element: (
      <ProtectedRoute>
        <AboutUsForm />
      </ProtectedRoute>
    ),
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
