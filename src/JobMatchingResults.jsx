import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function JobMatchingResults() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [shortlistFilter, setShortlistFilter] = useState("All"); // New filter

  useEffect(() => {
    fetch("http://localhost:8080/api/matchingresults")
      .then((response) => response.json())
      .then((data) => {
        setResults(data);
        setFilteredResults(data);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    let filtered = results;

    if (jobTypeFilter !== "All") {
      filtered = filtered.filter((job) => job.jobType === jobTypeFilter);
    }

    if (shortlistFilter === "Shortlisted") {
      filtered = filtered.filter((job) => job.shortlistFlag === true);
    } else if (shortlistFilter === "Not Shortlisted") {
      filtered = filtered.filter((job) => job.shortlistFlag === false);
    }

    setFilteredResults(filtered);
  }, [jobTypeFilter, shortlistFilter, results]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>AI Job Matching Results</h1>

      {/* Job Type Filter */}
      <label htmlFor="jobTypeFilter">Filter by Job Type: </label>
      <select
        id="jobTypeFilter"
        value={jobTypeFilter}
        onChange={(e) => setJobTypeFilter(e.target.value)}
        style={{ marginBottom: "15px", marginLeft: "10px", marginRight: "20px" }}
      >
        <option value="All">All</option>
        <option value="Full time">Full time</option>
        <option value="Part time">Part time</option>
      </select>

      {/* Shortlist Filter */}
      <label htmlFor="shortlistFilter">Filter by Shortlist: </label>
      <select
        id="shortlistFilter"
        value={shortlistFilter}
        onChange={(e) => setShortlistFilter(e.target.value)}
        style={{ marginBottom: "15px", marginLeft: "10px" }}
      >
        <option value="All">All</option>
        <option value="Shortlisted">Shortlisted</option>
        <option value="Not Shortlisted">Not Shortlisted</option>
      </select>

      {filteredResults.length === 0 ? (
        <p>No matching results found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Company</th>
              <th>URL</th>
              <th>AI Model</th>
              <th>Shortlist</th>
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {filteredResults.map((result, index) => (
              <tr key={index}>
                <td>{result.createdAt}</td>
                <td>{result.title}</td>
                <td>{result.company}</td>
                <td>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </td>
                <td>{result.aiModel}</td>
                <td>{result.shortlistFlag ? "✅" : "❌"}</td>
                <td>
                  <ReactMarkdown>{result.verdict}</ReactMarkdown>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default JobMatchingResults;
