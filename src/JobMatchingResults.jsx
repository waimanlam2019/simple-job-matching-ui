import React, { useEffect, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";

function JobMatchingResults() {
  const [results, setResults] = useState([]);
  const [expandedJobs, setExpandedJobs] = useState({});
  const [filters, setFilters] = useState({
    jobType: "All",
    minVotes: 3,
  });

  useEffect(() => {
    fetch("http://localhost:8080/api/matchingresults")
      .then((res) => res.json())
      .then(setResults)
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // Trigger batch job
  const triggerJobMatching = async () => {
    try {
      await fetch("http://localhost:8080/api/startjobmatching", {
        method: "POST",
      });
      alert("Job matching triggered ✅");
    } catch (err) {
      console.error("Error triggering job matching:", err);
      alert("Failed to trigger job matching ❌");
    }
  };

  // Stop batch job
  const stopJobMatching = async () => {
    try {
      await fetch("http://localhost:8080/api/stopjobmatching", {
        method: "POST",
      });
      alert("Job matching stopped ⏹️");
    } catch (err) {
      console.error("Error stopping job matching:", err);
      alert("Failed to stop job matching ❌");
    }
  };

  // Helper to format dates as "Today", "1 day ago", "X days ago"
  const formatDaysAgo = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
  };

  // Filtered, grouped, and minimum vote applied
  const groupedResults = useMemo(() => {
    const filtered = results.filter((job) => {
      if (filters.jobType !== "All" && job.jobType !== filters.jobType)
        return false;
      return true;
    });

    const grouped = filtered.reduce((acc, job) => {
      const key = `${job.title}-${job.company}-${job.url}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(job);
      return acc;
    }, {});

    return Object.entries(grouped).filter(
      ([_, reviews]) =>
        reviews.filter((r) => r.shortlistFlag).length >= filters.minVotes
    );
  }, [results, filters]);

  const toggleExpand = (key) =>
    setExpandedJobs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      {/* Control buttons at top left */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={triggerJobMatching}
          style={{ marginRight: 10, padding: "8px 12px", cursor: "pointer" }}
        >
          ▶ Run Job Matching
        </button>
        <button
          onClick={stopJobMatching}
          style={{ padding: "8px 12px", cursor: "pointer" }}
        >
          ⏹ Stop Job Matching
        </button>
      </div>

      <h1>AI Job Matching Results</h1>

      {/* Filters */}
      <div style={{ marginBottom: 15 }}>
        <label>
          Job Type:
          <select
            value={filters.jobType}
            onChange={(e) =>
              setFilters({ ...filters, jobType: e.target.value })
            }
            style={{ marginLeft: 10, marginRight: 20 }}
          >
            <option>All</option>
            <option>Full time</option>
            <option>Contract/Temp</option>
            <option>Part time</option>
          </select>
        </label>

        <label>
          Minimum Votes:
          <select
            value={filters.minVotes}
            onChange={(e) =>
              setFilters({ ...filters, minVotes: parseInt(e.target.value) })
            }
            style={{ marginLeft: 10 }}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      {groupedResults.length === 0 ? (
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
              <th>AI Model</th>
              <th>Verdict</th>
              <th>Shortlist</th>
            </tr>
          </thead>
          <tbody>
            {groupedResults.map(([key, reviews]) => {
              const first = reviews[0];
              const votes = reviews.filter((r) => r.shortlistFlag).length;

              return (
                <React.Fragment key={key}>
                  <tr>
                    <td>
                      <button onClick={() => toggleExpand(key)}>
                        {expandedJobs[key] ? "−" : "+"}
                      </button>
                    </td>
                    <td>{formatDaysAgo(first.createdAt)}</td>
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
                    <td>—</td>
                    <td>—</td>
                    <td>{votes > 0 ? "✅" : "❌"}</td>
                  </tr>

                  {/* Expanded rows with AI Model and Verdict */}
                  {expandedJobs[key] &&
                    reviews.map((r, i) => (
                      <tr key={i} style={{ backgroundColor: "#f9f9f9" }}>
                        <td></td>
                        <td>{formatDaysAgo(r.createdAt)}</td>
                        <td>{r.title}</td>
                        <td>{r.company}</td>
                        <td>
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Link
                          </a>
                        </td>
                        <td>{r.aiModel}</td>
                        <td>
                          <ReactMarkdown>{r.verdict}</ReactMarkdown>
                        </td>
                        <td>{r.shortlistFlag ? "✅" : "❌"}</td>
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
