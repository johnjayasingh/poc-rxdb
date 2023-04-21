import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { get } from "../database/Database";

export default function EditProfile(props) {

  const items = [];

  for (const sub of props.data.subscribe) {
    items.push(
      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>{sub.key}</Form.Label>
        <Form.Control id={sub.key} type="text" placeholder={sub.key} defaultValue={sub.value} />
      </Form.Group>
    )
  }


  useEffect(() => {
    const listeners = [];
    for (const _emit of props.data.emit) {
      document.getElementById(_emit.key).addEventListener('change', async (event)=>{
        console.log(`capture ${_emit.key} value ${event.target.value}`)
        const db = await get();
        const keys = event.target.id?.split('_');
        // const data = db[event.target.id?.split('_')[0]].findOne({
        //   selector: {
        //     email: {
        //       $eq: props.data.subscribe?.find(sub=> sub.key?.includes('email')).value
        //     }
        //   }
        // })
        // console.log(data);
        // const addData = {
        //   name,
        //   color
        // };
        await db[keys[0]].insert({
          id: `${Math.random()* 1000}`,
          [keys[1]]: event.target.value
        });
        console.log({
          id: `${Math.random()* 1000}`,
          [keys[1]]: event.target.value
        })
        // this.setState({
        //   name: '',
        //   // color: ''
        // });
      })
    }
  }, [props.data.emit])


  return (
    <div className="my-5 ">
      <h6>{props.name}</h6>
      <Form>
        {items}
      </Form>
    </div>
  )
}
