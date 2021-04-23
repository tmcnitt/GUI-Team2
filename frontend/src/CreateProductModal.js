import React, { useState, useRef, useContext } from 'react'
import { AppContext } from "./AppContext.js";
import axios from "axios"
import { capitalize } from './utils'


export function CreateProductModal({ products, setProducts }) {
    const { baseURL } = useContext(AppContext);

    const [name, setName] = useState("")
    const productRef = useRef(null)

    const createProduct = () => {
        //Formdata since JSON for file uploads doesnt work well
        let formData = new FormData();
        formData.append('file', productRef.current.files[0]);
        formData.append('name', name);

        //Uplodat this file to express middleware
        axios.post(baseURL + '/products',
            formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
        ).then(function (r) {
            if (r.data.success) {
                productRef.current.value = null

                //Update our products list for the listing field
                let pClone = [...products]
                pClone.push(
                    <option value={r.data.data}>{capitalize(name)}</option>
                )
                setName("")
                setProducts(pClone)
            }
        })
    }


    return (
        <div className="modal fade modal-fullscreen-md-down" id="productModal" tabIndex="1" aria-labelledby="productModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="productModalLabel">Create Product</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="row g-3 mb-3">
                                <div className="col-3">
                                    <label htmlFor="name" className="col-form-label" >Name</label>
                                </div>
                                <div className="col-9">
                                    <input type="text" id="name" className="form-control" value={name} onChange={(event) => setName(event.target.value)} />
                                </div>
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-3">
                                    <label htmlFor="picture" className="col-form-label">Picture</label>
                                </div>
                                <div className="col-9">
                                    <input type="file" className="form-control" id="picture" ref={productRef} accept="image/jpeg"></input>
                                </div>
                            </div>

                        </form>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#listingModal">Close</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#listingModal" onClick={() => createProduct()}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )

}