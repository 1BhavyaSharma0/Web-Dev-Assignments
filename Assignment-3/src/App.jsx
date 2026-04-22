
import { useState } from "react";
import StudentForm from "./components/StudentForm";
import StudentTable from "./components/StudentTable";
import Summary from "./components/Summary";

function App() {
  const [students, setStudents] = useState([
    { id: 1, name: "Ayushi Rai", marks: 90 },
    { id: 2, name: "Ritvik Rai", marks: 93},
    { id: 3, name: "Yatharth Rai", marks: 99 },
    { id: 4, name: "Anushka Rai", marks: 39 }
  ]);

  const updateMarks = (id, newMarks) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, marks: Number(newMarks) } : s
    );
    setStudents(updated);
  };

  return (
    <div className="container">
      <h1>Student Report Card</h1>

      <StudentForm students={students} setStudents={setStudents} />

      <StudentTable students={students} updateMarks={updateMarks} />

      <Summary students={students} />
    </div>
  );
}

export default App;