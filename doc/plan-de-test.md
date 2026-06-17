# Plan de tests

## 1. Objectifs

- Vérifier que chaque module fonctionne correctement **en isolation**.
- Atteindre et maintenir une **couverture de code d'un minimum de 70% de lignes**
- Servir de filet de sécurité contre les régressions lors des évolutions.


## 2. Cas de tests

### tasksController

  | ID | Fonction | Scénario | Entrée | Résultat attendu |
  |----|----------|----------|--------|------------------|
  | TC-CTRL-01 | getTasks | Sans filtre | query = {} | success: true + toutes les tâches |
  | TC-CTRL-02 | getTasks | Filtres status/assignee/priority | query = { status, assignee, priority } | success: true + liste filtrée |
  | TC-CTRL-03 | getTaskById | Non trouvée | params.id = missing | 404 + error: 'Task not found' |
  | TC-CTRL-04 | getTaskById | Trouvée | params.id = 1 | success: true + task |
  | TC-CTRL-05 | createTask | Title manquant | body = { description } | 400 + error: 'Title is required' |
  | TC-CTRL-06 | createTask | Status invalide | body = { title, status: 'blocked' } | 400 + error: 'Status must be one of: todo, doing, done' |
  | TC-CTRL-07 | createTask | Priority invalide | body = { title, priority: 'urgent' } | 400 + error: 'Priority must be one of: LOW, MEDIUM, HIGH' |
  | TC-CTRL-08 | createTask | Input valide | body = { title, status, priority, assignee, dueDate } | 201 + tâche créée |
  | TC-CTRL-09 | createTask | Sans status | body = { title } | 201 + tâche créée |
  | TC-CTRL-10 | updateTask | Non existante | params.id = missing | 404 + error: 'Task not found' |
  | TC-CTRL-11 | updateTask | Mise à jour valide | params.id = 1, body = { title: 'New' } | success: true + tâche mise à jour |
  | TC-CTRL-12 | updateTask | Status invalide | body = { status: 'not-a-real-status' } | 400 |
  | TC-CTRL-13 | updateTask | Priority invalide | body = { priority: 'not-a-real-priority' } | 400 |
  | TC-CTRL-14 | deleteTask | Non existante | params.id = missing | 404 + error: 'Task not found' |
  | TC-CTRL-15 | deleteTask | Existante | params.id = 1 | success: true + tâche supprimée |
  | TC-CTRL-16 | moveTask | Non existante | params.id = missing | 404 + error: 'Task not found' |
  | TC-CTRL-17 | moveTask | Status manquant | body = {} | 400 + error: 'New status is required' |
  | TC-CTRL-18 | moveTask | Status invalide | body = { status: 'banana' } | 400 |
  | TC-CTRL-19 | moveTask | Move valide | body = { status: 'doing' } | success: true + tâche mise à jour |
  | TC-CTRL-20 | getStats | Totaux et regroupements | - | success: true + total/byStatus/byPriority/overdue |
  | TC-CTRL-21 | getStats | dueDate absent | - | overdue = 0 |
  | TC-CTRL-22 | getStats | dueDate null (bug connu) | - | overdue = 1 |

### tasksModel

  | ID | Fonction | Scénario | Entrée | Résultat attendu |
  |----|----------|----------|--------|------------------|
  | TC-MOD-01 | findAll | Aucun filtre | - | retourne la liste complète des tâches seedées |
  | TC-MOD-02 | findAll | Filtre status | status = 'done' | retourne uniquement les tâches avec status 'done' |
  | TC-MOD-03 | findAll | Filtre assignee | assignee = 'alice' | retourne uniquement les tâches assignées à alice |
  | TC-MOD-04 | findAll | Filtre priority | priority = 'HIGH' | retourne uniquement les tâches avec priority 'HIGH' |
  | TC-MOD-05 | findAll | Filtres combinés | status + assignee | retourne les tâches correspondant aux deux filtres |
  | TC-MOD-06 | findAll | Aucun match | assignee = 'nobody' | retourne [] |
  | TC-MOD-07 | findById | Identifiant existant (string) | id = '1' | retourne la tâche correspondante |
  | TC-MOD-08 | findById | Identifiant existant (number) | id = 2 | retourne la tâche correspondante |
  | TC-MOD-09 | findById | Identifiant inexistant | id = 999 | retourne undefined |
  | TC-MOD-10 | create | Champs minimaux | title only | crée la tâche avec valeurs par défaut |
  | TC-MOD-11 | create | Données complètes | title, description, status, priority, assignee, dueDate | crée et retourne la tâche complète |
  | TC-MOD-12 | update | Identifiant inexistant | id = 999, data = { title: 'Nouveau' } | retourne null |
  | TC-MOD-13 | update | Mise à jour partielle | id = 1, data = { title: 'Updated title', priority: 'LOW' } | met à jour les champs et conserve les autres |
  | TC-MOD-14 | update | Ne permet pas de modifier l'id | id = 1, data = { id: 999 } | l'id reste 1 |
  | TC-MOD-15 | delete | Identifiant existant | id = 1 | supprime et retourne la tâche |
  | TC-MOD-16 | delete | Identifiant inexistant | id = 999 | retourne null |