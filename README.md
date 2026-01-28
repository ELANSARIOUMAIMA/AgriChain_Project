# AgriChain – Supplier & Demand Management System 🌱

## 📌 Project Overview
AgriChain is a web-based application designed to manage agricultural product demands between **directors** and **suppliers**.  
The system allows suppliers to view incoming demands, propose products with prices and quantities, and track the history of validated or canceled demands.

The backend is powered by **Oracle APEX RESTful Services**, while the frontend uses **HTML, CSS, and JavaScript**.

---

## 🏗️ Architecture
- **Frontend**: HTML, CSS, JavaScript (Fetch API)
- **Backend**: Oracle APEX (ORDS REST APIs)
- **Database**: Oracle Database
- **Authentication**: Supplier login via REST API
- **Storage**: Browser `localStorage`
- **Version Control**: Git & GitHub 

---

## ✨ Features

### 👤 Supplier Side
- Secure login
- View received demands (status: **ENVOYEE**)
- Propose products (price & quantity)
- Modify proposed quantities
- View demand history (**VALIDE / ANNULEE**)
- View detailed product history per demand
- Logout

### 👥 Client Side
- View demand details
- Track supplier proposals

### 🧑‍💼 Director Side
- Implemented using **Oracle APEX**
- Validate supplier demands
- Cancel supplier demands
- Adjust quantities before validation

---

## 🔗 REST API Endpoints (Examples)

| Method | Endpoint | Description |
|------|--------|------------|
| GET | `/fournisseur/login` | Supplier authentication |
| GET | `/fournisseur/demandes/{id}` | Retrieve supplier demands |
| GET | `/fournisseur/produits/{id}` | Retrieve products for a demand |
| POST | `/fournisseur/proposer` | Submit product proposals |

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ELANSARIOUMAIMA/AgriChain_Project.git
cd AgriChain_Project
