

const StudentTable = ({ students, updateMarks }) => {
  return (
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Name</th>
          <th>Marks</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {students.map((s) => {
          const status = s.marks >= 40 ? "Pass" : "Fail";

          return (
            <tr key={s.id}>
              <td>{s.name}</td>

              <td>
                <input
                  type="number"
                  value={s.marks}
                  onChange={(e) => updateMarks(s.id, e.target.value)}
                />
              </td>

              <td style={{ color: s.marks >= 40 ? "green" : "red" }}>
                {status}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default StudentTable;