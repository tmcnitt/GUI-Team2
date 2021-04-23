import React from "react";

export function ConfirmStopModal({ confirm }) {
  return (
    <>
      <div
        className="modal fade"
        id="confirmModal"
        tabindex="-1"
        aria-labelledby="confirmModalTitle"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirmModalTitle">
                Confirm Delete
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <h3>
                Are you sure you want to stop this listing? It cannot be undone
              </h3>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
                onClick={() => confirm()}
              >
                Do it!
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                data-bs-toggle="modal"
                data-bs-target="#confirmModal"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
