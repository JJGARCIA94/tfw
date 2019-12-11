import React from 'react'

export default function User(props) {
    const aleatorio = Math.floor(Math.random() * (999999 - 100000)) + 100000;
    console.log(aleatorio);
    return (
        <div>
            user
        </div>
    )
}
