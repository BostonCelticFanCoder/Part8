import React from 'react';
import { useQuery } from '@apollo/client';
import { ME } from '../queries';

const Recommendations = (props) => {
    const result = useQuery(ME);
    if (result.loading) return <p>Loading...</p>;
    if (result.error) return <p>Error</p>;

    if (!props.show) {
        return null
    }
    //fix errors; not working
    console.log(result.data)

    return (
        <div>
            <h2>Recommendations</h2>
            <p>books in your favorite genre </p>
        </div>
    );
};

export default Recommendations;