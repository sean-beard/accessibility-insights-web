// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import {
    ExportFormat,
    ExportFormProps,
    ReportExportService,
} from 'report-export/types/report-export-service';

const CodePenReportExportServiceKey: ExportFormat = 'codepen';

class ExportForm extends React.Component<ExportFormProps> {
    private buttonRef: React.RefObject<HTMLButtonElement>;

    constructor(props) {
        super(props);
        this.buttonRef = React.createRef();
    }

    public componentDidMount(): void {
        if (this.buttonRef.current) {
            this.buttonRef.current.click();
            this.props.onSubmit();
        }
    }

    public render(): JSX.Element {
        return (
            <form
                action="https://codepen.io/pen/define"
                method="POST"
                target="_blank"
                rel="noopener"
                style={{ visibility: 'hidden' }}
            >
                <input
                    name="data"
                    type="hidden"
                    value={JSON.stringify({
                        title: this.props.fileName,
                        description: this.props.description,
                        html: this.props.html,
                        editors: '100', // collapse CSS and JS editors
                    })}
                />
                <button type="submit" ref={this.buttonRef} />
            </form>
        );
    }
}

export const CodePenReportExportService: ReportExportService = {
    key: CodePenReportExportServiceKey,
    displayName: 'CodePen',
    exportForm: ExportForm,
};
