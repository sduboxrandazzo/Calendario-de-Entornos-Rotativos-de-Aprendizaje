Reserva de Entornos de Aprendizaje - MVP
Descripción del Proyecto
Este proyecto es un sistema de reservas para entornos de aprendizaje, diseñado para gestionar la asignación de espacios para clases de manera intuitiva y eficiente. El sistema permite que los docentes realicen reservas individuales para cada clase, y si no se realiza una reserva, se asigna un entorno de forma aleatoria, con la posibilidad de revertir dicha asignación. Además, incluye funcionalidades de importación manual del horario y edición autónoma de reservas por parte de los docentes.
Funcionalidades Principales
•	Autenticación y Autorización:
o	Inicio de sesión para docentes y administradores.
o	Funcionalidad "recordarme" para mantener la sesión activa.
•	Dashboard para Docentes:
o	Visualización del calendario semanal con el horario importado.
o	Reserva y edición de entornos para cada clase.
•	Dashboard para Administradores:
o	Visualización global del calendario.
o	Herramientas para asignación aleatoria de entornos en clases sin reserva y reversibilidad de esas asignaciones.
o	Importación manual del horario desde Google Sheets.
o	Exportación de datos y generación de estadísticas básicas.
Stack Tecnológico
•	Frontend: React con Material-UI (o Bootstrap) para una interfaz responsive e intuitiva.
•	Backend: Node.js con Express para la creación de APIs RESTful.
•	Base de Datos: PostgreSQL (o MySQL) para almacenar usuarios, reservas y horarios.
•	Autenticación: JSON Web Tokens (JWT) para manejar sesiones y la funcionalidad "recordarme".
•	Integración: Posible uso de la API de Google Sheets para la importación manual del horario.

