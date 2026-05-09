import React from 'react';

const PayApp = () => {
    return (
        <div className="h-full w-full overflow-hidden">
            <iframe
                src="/pay/index.html"
                title="BP Pay"
                className="w-full h-full border-none"
            />
        </div>
    );
};

export default PayApp;
