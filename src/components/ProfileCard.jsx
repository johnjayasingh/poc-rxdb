import React from "react";
import { Image } from "react-bootstrap";

export default function ProfileCard(props) {
  console.log(props)

  const items = [];

  for (const sub of props.data.subscribe) {
    if (sub.key === 'profile_name') {
      items.push(<h3>{sub.value}</h3>)
    }
    if (sub.key === 'profile_image') {
      items.push(<Image style={{
        width: 200
      }} roundedCircle src={sub.value} />)
    }
  }

  return (
    <div className="my-5 ">
      <h6>{props.name}</h6>
      {items}
    </div>
  )
}
