import React from "react";
import { Form } from "react-bootstrap";

export default function EditProfile(props) {

  const items = [];

  for (const sub of props.data.subscribe) {
    items.push(
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>{sub.key}</Form.Label>
        <Form.Control type="text" placeholder={sub.key} defaultValue={sub.value} />
      </Form.Group>
    )
  }

  return (
    <div className="my-5 ">
      <h6>{props.name}</h6>
      <Form>

        {items}
      </Form>
    </div>
  )
}
