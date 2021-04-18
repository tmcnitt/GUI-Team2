import React, { useState } from "react";

export function CreateReviewModal({ createReview }) {
    let [values, setValues] = useState({ stars: "0", msg: "" })

    const handleInputChange = (e) => {
        let { name, value, checked } = e.target;
        if (e.target.type == "checkbox") {
            value = checked
        }
        setValues({ ...values, [name]: value });
    };

    return (
        <div className="modal fade" id="reviewModal" tabIndex="1" aria-labelledby="reviewModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="reviewModalLabel">Leave Review</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <form>
                            <div className="row g-3 mb-3">
                                <div className="col-3">
                                    <label htmlFor="stars" className="col-form-label">Stars</label>
                                </div>
                                <div className="col-9">
                                    <select autoComplete="true" name="stars" id="stars" className="form-control" value={values.stars} onChange={handleInputChange}>
                                        <option value="0">0 Stars</option>
                                        <option value="1">1 Star</option>
                                        <option value="2">2 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="5">5 Stars</option>
                                    </select>
                                </div>
                            </div>
                            <div className="row g-3 mb-3">
                                <div className="col-3">
                                    <label htmlFor="msg" className="col-form-label">Review</label>
                                </div>
                                <div className="col-9">
                                    <textarea className="form-control" name="msg" id="msg" rows="3" onChange={handleInputChange} value={values.msg}></textarea>
                                </div>
                            </div>
                        </form>

                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" data-bs-dismiss="modal" onClick={() => createReview(values)}>Create</button>
                    </div>
                </div>
            </div>
        </div>
    )
}