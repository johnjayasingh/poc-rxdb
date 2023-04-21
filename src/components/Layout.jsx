import React from "react"
import components from './index'
export default function Layout(props) {
    console.log(props);
    const left = [];
    const right = [];

    for (const property of props.properties) {
        if (property.key === 'enableProfile') {
            right.push(<button class="btn btn-secondary my-2 my-sm-0">{property.value ? 'John Doe' : 'Sign In'}</button>)
        }
    }

    return <main class="container">
        <div class="header clearfix">
            <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">{props.name}</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarColor01">
                        <ul class="navbar-nav me-auto">
                            {left}
                        </ul>
                        <div class="d-flex">
                            {right}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
        {props?.childrens?.map(children => {
            const Component = components[children.component];
            return <Component {...children} />
        })}
    </main>
}