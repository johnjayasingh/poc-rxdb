import React, { useEffect } from "react";
import { Form } from "react-bootstrap";
import { get } from "../database/Database";

export default function EditProfile(props) {
  const profileId = 'johndoe'
  const items = [];

  for (const sub of props.data.subscribe) {
    items.push(
      <div class="form-group">
        <fieldset>
          <label class="form-label" htmlFor={sub.key}>{sub.key}</label>
          <input class="form-control" id={sub.key} type="text" placeholder={sub.key} defaultValue={sub.value} />
        </fieldset>
      </div>
    )
  }


  useEffect(() => {
    const listeners = [];
    const subToData = async () => {
      for (const sub of props.data.subscribe) {
        const keys = sub.key?.split('_');
        const db = await get();
        db[keys[0]].findByIds([profileId]).$.subscribe(data => {
          data = data.get(profileId).toJSON();
          for (const key of Object.keys(data)) {
            const id = `${keys[0]}_${key}`;
            const component =  document.getElementById(id);
            console.log('data[key]', data[key])
            console.log(`id ${id}`)
            console.log('document',);
            if (data[key] && component) {
              component.value = data[key];
            }
          }
        });
      }
    }
    subToData();
    for (const _emit of props.data.emit) {
      document.getElementById(_emit.key).addEventListener('change', async (event) => {
        console.log(`capture ${_emit.key} value ${event.target.value}`)
        const db = await get();
        const keys = event.target.id?.split('_');
        const data = await db[keys[0]].findByIds([profileId]).exec()
        const existing = data.get(profileId).toJSON();
        await db[keys[0]].upsert({
          ...existing,
          id: profileId,
          [keys[1]]: event.target.value
        });
        console.log({
          ...existing,
          id: profileId,
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
      <form>
        {items}
      </form>
    </div>
  )
}
