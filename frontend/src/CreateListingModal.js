import React, { useEffect, useState, useContext, useRef } from "react"
import { CreateProductModal } from './CreateProductModal'
import { AppContext } from "./AppContext.js";
import axios from "axios";
import { capitalize, axiosJWTHeader, validateFixed, validateAuction, dateToISOLikeButLocal } from './utils'
import { Modal } from 'bootstrap'

function AuctionForm({ values, handleInputChange }) {

    const setNow = () => {
        handleInputChange({ target: { name: "start_date", value: dateToISOLikeButLocal(new Date()) } })
    }
    return (
        <>
            <div className="row g-3 mb-3">
                <div className="col-3">
                    <label htmlFor="start_date" className="col-form-label">Start</label>
                </div>
                <div className="col-7">
                    <input type="datetime-local" name="start_date" id="start_date" onChange={handleInputChange} value={values.start_date} className="form-control" />
                </div>
                <div className="col-2">
                    <button type="button" className="btn btn-primary" onClick={() => setNow()} >Now</button>
                </div>
            </div>
            <div className="row g-3 mb-3">
                <div className="col-3">
                    <label htmlFor="end_date" className="col-form-label">End</label>
                </div>

                <div className="col-9">
                    <input type="datetime-local" name="end_date" id="end_date" onChange={handleInputChange} value={values.end_date} className="form-control" />
                </div>
            </div >

            <div className="row g-3 mb-1">
                <div className="col-3">
                    <label htmlFor="current_bid" className="col-form-label">Starting Bid</label>
                </div>
                <div className="col-9">
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">$</span>
                        <input type="number" name="current_bid" id="current_bid" onChange={handleInputChange} value={values.current_bid} className="form-control" aria-describedby="basic-addon1" />
                    </div>

                </div>

            </div >
            <div className="row mb-3">
                <div className="col-5">
                    <label htmlFor="show_user_bid" className="col-form-label">Display Leading User?</label>
                </div>
                <div className="col-7">
                    <div className="form-check form-check-inline col-form-label">
                        <input className="form-check-input" name="show_user_bid" id="show_user_bid" onChange={handleInputChange} value={values.show_user_bid} type="checkbox" />
                    </div>
                </div>
            </div >
        </>
    )
}

function FixedForm({ values, handleInputChange }) {
    return (
        <>
            <div className="row g-3 mb-1">
                <div className="col-3">
                    <label htmlFor="base_price" className="col-form-label">Price Per Unit</label>
                </div>
                <div className="col-9">
                    <div className="input-group mb-3">
                        <span className="input-group-text" id="basic-addon1">$</span>
                        <input type="number" name="base_price" id="base_price" className="form-control" onChange={handleInputChange} value={values.base_price} aria-describedby="basic-addon1" />
                    </div>

                </div>

            </div>
            <div className="row g-3 mb-1">
                <div className="col-3">
                    <label htmlFor="quantity" className="col-form-label">Units Avilable</label>
                </div>
                <div className="col-9">
                    <div className="input-group mb-3">
                        <input type="number" id="quantity" name="quantity" className="form-control" onChange={handleInputChange} value={values.quantity} />
                    </div>

                </div>

            </div >
        </>
    )
}

export function CreateListingModal({ show, setShow }) {
    let [listType, setListType] = useState("auction")

    const { baseURL, JWT } = useContext(AppContext);

    let [products, setProducts] = useState([]);

    let [bannerMessage, setBannerMessage] = useState("")

    const defaultValues = {
        product_id: 0,
        description: "",
        start_date: "",
        end_date: "",
        current_bid: "",
        show_user_bid: false,
        base_price: 0,
        quantity: 0
    }

    let [values, setValues] = useState(defaultValues)

    const handleInputChange = (e) => {
        let { name, value, checked } = e.target;
        if (e.target.type === "checkbox") {
            value = checked
        }
        setValues({ ...values, [name]: value });
    };

    const submit = () => {
        let route = ""
        let error = false
        if (listType === "auction") {
            route = "/auctions"
            error = validateAuction(values)
        } else {
            route = "/fixed"
            error = validateFixed(values)
        }

        setBannerMessage(error)
        if (error) {
            return
        }

        axios.post(baseURL + route, values, {
            headers: axiosJWTHeader(JWT),
        }).then((r) => {
            setBannerMessage(r.data.msg)
            setTimeout(() => {
                setShow(false)
            }, 1000)
            setValues(defaultValues)
        }).catch((r) => {
            setBannerMessage(r.response.data.msg)
        })
    }

    //On load, get products from API
    useEffect(() => {
        axios.get(baseURL + '/products').then((data) => {
            let elements = []
            data.data.data.forEach(product => {
                elements.push(
                    <option value={product.id} key={product.id}>{capitalize(product.name)}</option>
                )
            })
            setProducts(elements)
        })

    }, [])

    const [modal, setModal] = useState(null)
    const modalRef = useRef()

    useEffect(() => {
        setModal(new Modal(modalRef.current))
    }, [])

    useEffect(() => {
        if (modal) {
            modal.toggle()
        }
    }, [show])

    let banner = <></>;
    if (bannerMessage) {
        banner = (
            <div className="alert alert-primary" role="alert">
                {bannerMessage}
            </div>
        );
    }
    return (
        <>
            <CreateProductModal products={products} setProducts={setProducts} />

            <div ref={modalRef} className="modal fade" id="listingModal" tabindex="-1" aria-labelledby="listingModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="listingModalLabel">Create Listing</h5>
                            <button type="button" className="btn-close" onClick={() => setShow(false)}></button>
                        </div>
                        <div className="modal-body">
                            {banner}
                            <form>
                                <div className="row g-3 mb-3">
                                    <div className="col-3">
                                        <label htmlFor="product" className="col-form-label">Product</label>
                                    </div>
                                    <div className="col-7">
                                        <select autoComplete="true" name="product_id" id="product" className="form-control" value={values.product_id} onChange={handleInputChange}>
                                            <option value="0">Select Product</option>
                                            {products}
                                        </select>
                                    </div>
                                    <div className="col-2">
                                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#productModal">Create</button>
                                    </div>
                                </div>
                                <fieldset className="form-group mb-3">
                                    <div className="row">
                                        <legend className="col-form-label col-sm-3 pt-0">Type</legend>
                                        <div className="col-sm-9" onChange={(event) => setListType(event.target.value)}>
                                            <div className="form-check">
                                                <input className="form-check-input" defaultChecked type="radio" name="gridRadios" id="gridRadios1" value="auction" />
                                                <label className="form-check-label" htmlFor="gridRadios1">
                                                    Auction
                                            </label>
                                            </div>
                                            <div className="form-check">
                                                <input className="form-check-input" type="radio" name="gridRadios" id="gridRadios2" value="fixed" />
                                                <label className="form-check-label" htmlFor="gridRadios2">
                                                    Fixed Price
                                            </label>
                                            </div>
                                        </div>
                                    </div>
                                </fieldset>
                                {listType == "auction" && <AuctionForm handleInputChange={handleInputChange} values={values} />}
                                {listType == "fixed" && <FixedForm handleInputChange={handleInputChange} values={values} />}
                                <div className="row g-3 mb-3">
                                    <div className="col-3">
                                        <label htmlFor="description" className="col-form-label">Description</label>
                                    </div>
                                    <div className="col-9">
                                        <textarea className="form-control" name="description" id="description" rows="3" onChange={handleInputChange} value={values.description}></textarea>
                                    </div>
                                </div>

                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
                            <button type="button" className="btn btn-primary" onClick={() => submit()} >Create</button>
                        </div>
                    </div >
                </div >
            </div >
        </>
    )
}