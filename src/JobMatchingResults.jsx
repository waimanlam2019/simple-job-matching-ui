import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function JobMatchingResults() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [shortlistFilter, setShortlistFilter] = useState("All");

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

  // Group results by unique job (title + company + url as a key)
  const groupedResults = filteredResults.reduce((acc, result) => {
    const key = `${result.title}-${result.company}-${result.url}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(result);
    return acc;
  }, {});

  const toggleExpand = (key) => {
    setExpandedJobs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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
        <option value="Contract/Temp">Contract/Temp</option>
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

      {Object.keys(groupedResults).length === 0 ? (
        <p>No matching results found.</p>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0" width="100%">
          <thead>
            <tr>
              <th></th>
              <th>Date</th>
              <th>Title</th>
              <th>Company</th>
              <th>URL</th>
              <th>Shortlist</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedResults).map(([key, reviews]) => {
              const first = reviews[0]; // show base info
              return (
                <React.Fragment key={key}>
                  {/* Parent row */}
                  <tr>
                    <td>
                      <button onClick={() => toggleExpand(key)}>
                        {expandedJobs[key] ? "−" : "+"}
                      </button>
                    </td>
                    <td>{first.createdAt}</td>
                    <td>{first.title}</td>
                    <td>{first.company}</td>
                    <td>
                      <a
                        href={first.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Link
                      </a>
                    </td>
                    <td>
                      {reviews.some((r) => r.shortlistFlag) ? "✅" : "❌"}
                    </td>
                  </tr>

                  {/* Expanded rows */}
                  {expandedJobs[key] &&
                    reviews.map((r, i) => (
                      <tr key={i} style={{ backgroundColor: "#f9f9f9" }}>
                        <td></td>
                        <td colSpan="2">AI Model: {r.aiModel}</td>
                        <td>Shortlist: {r.shortlistFlag ? "✅" : "❌"}</td>
                        <td colSpan="2">
                          <ReactMarkdown>{r.verdict}</ReactMarkdown>
                        </td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default JobMatchingResults;
