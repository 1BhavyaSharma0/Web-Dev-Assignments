

const Summary = ({ students }) => {
  const total = students.reduce((sum, s) => sum + s.marks, 0);
  const avg = students.length > 0 ? (total / students.length).toFixed(2) : 0;
  const passed = students.filter((s) => s.marks >= 40).length;
  const failed = students.length - passed;

  return (
    <div className="summary">
      <h3>Summary</h3>
      <p>Total Marks: {total}</p>
      <p>Average Marks: {avg}</p>
      <p>Passed Students: {passed}</p>
      <p>Failed Students: {failed}</p>
    </div>
  );
};

export default Summary;