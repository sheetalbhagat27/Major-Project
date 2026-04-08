// Student table में नया column
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'enrollmentId', label: 'Enrollment ID' },
  { key: 'OGI', label: 'OGI Score', render: (value) => (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
      value >= 80 ? 'bg-green-100 text-green-800' : 
      value >= 60 ? 'bg-yellow-100 text-yellow-800' : 
      'bg-red-100 text-red-800'
    }`}>
      {value}/100
    </span>
  )},
  // ... other columns
];
