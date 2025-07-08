import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState(null);

    const fetchEvents = async() => {
        try {
            const response = await fetch('http://localhost:3000/events'); // Adjust if your server port is different
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEvents(data);
            setError(null);
        } catch (error) {
            console.error("Error fetching events:", error);
            setError("Failed to fetch events. Please ensure the server is running.");
        }
    };

    useEffect(() => {
        fetchEvents(); // Fetch immediately on component mount

        const intervalId = setInterval(fetchEvents, 15000); // Poll every 15 seconds

        return () => clearInterval(intervalId); // Clear interval on component unmount
    }, []);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
            timeZoneName: 'shortOffset'
        });
    };

    const renderEvent = (event) => {
        const timestamp = formatTimestamp(event.timestamp);

        switch (event.eventType) {
            case 'push':
                return `${event.author} pushed to ${event.toBranch} on ${timestamp}`;
            case 'pull_request':
                return `${event.author} submitted a pull request from ${event.fromBranch} to ${event.toBranch} on ${timestamp}`;
            case 'merge':
                return `${event.author} merged branch ${event.fromBranch} to ${event.toBranch} on ${timestamp}`;
            default:
                return `Unknown event type: ${event.eventType} by ${event.author} on ${timestamp}`;
        }
    };

    return ( <
        div className = "App" >
        <
        header className = "App-header" >
        <
        h1 > GitHub Repository Activity < /h1> <
        /header> <
        main > {
            error && < p className = "error-message" > { error } < /p>} {
                events.length === 0 && !error ? ( <
                    p > No events to display yet.Perform some GitHub actions! < /p>
                ) : ( <
                    ul className = "event-list" > {
                        events.map((event, index) => ( <
                            li key = { event._id || index }
                            className = "event-item" > { renderEvent(event) } <
                            /li>
                        ))
                    } <
                    /ul>
                )
            } <
            /main> <
            /div>
        );
    }

    export default App;