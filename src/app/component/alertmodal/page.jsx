export default function AlertModal({msg1, msg2, onClose, onClick}) { 
    return (
        <div className="alert-modal-overlay">
            <div className="alert-modal-content">
                <div className="alert-modal-icon">✔</div>
                <h2 className="alert-modal-title">{msg1}</h2>
                <p className="alert-modal-message">{msg2}</p>
                <div className="alert-modal-buttons">
                    <button
                        onClick={onClose}
                        className="alert-modal-btn cancel">
                        취소
                    </button>
                    <button
                        onClick={onClick}
                        className="alert-modal-btn confirm">
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
}
