

import { useState } from "react";

const StudentForm = ({ students, setStudents }) => {
  const [name, setName] = useState("");
  const [marks, setMarks] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const newStudent = {
      id: Date.now(),
      name: name,
      marks: Number(marks),
    };

    setStudents([...students, newStudent]);

    setName("");
    setMarks("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="number"
        placeholder="Enter marks"
        value={marks}
        onChange={(e) => setMarks(e.target.value)}
      />

      <button type="submit">Add Student</button>
    </form>
  );
};

export default StudentForm;