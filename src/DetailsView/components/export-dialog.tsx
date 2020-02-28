// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { PrimaryButton } from 'office-ui-fabric-react';
import { Dialog, DialogFooter, DialogType } from 'office-ui-fabric-react';
import { TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { ReportExportServiceProviderImpl } from 'report-export/report-export-service-provider-impl';
import { ExportFormat } from 'report-export/types/report-export-service';
import { ExportResultType } from '../../common/extension-telemetry-events';
import { FileURLProvider } from '../../common/file-url-provider';
import { NamedFC } from '../../common/react/named-fc';
import { DetailsViewActionMessageCreator } from '../actions/details-view-action-message-creator';

export interface ExportDialogProps {
    deps: ExportDialogDeps;
    isOpen: boolean;
    fileName: string;
    description: string;
    html: string;
    onClose: () => void;
    onDescriptionChange: (value: string) => void;
    exportResultsType: ExportResultType;
    onExportClick: () => void;
}

export interface ExportDialogDeps {
    detailsViewActionMessageCreator: DetailsViewActionMessageCreator;
    fileURLProvider: FileURLProvider;
}

export const ExportDialog = NamedFC<ExportDialogProps>('ExportDialog', props => {
    const [format, setFormat] = React.useState<ExportFormat | null>(null);

    const onDismiss = (): void => {
        props.onClose();
    };

    const onExportLinkClick = (
        event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
        exportFormat: ExportFormat,
    ): void => {
        const { detailsViewActionMessageCreator } = props.deps;
        props.onDescriptionChange(props.description);
        detailsViewActionMessageCreator.exportResultsClicked(
            props.exportResultsType,
            props.html,
            event,
        );
        setFormat(exportFormat);
        props.onExportClick();
        props.onClose();
    };

    const onDescriptionChange = (event, value: string): void => {
        props.onDescriptionChange(value);
    };

    const fileURL = props.deps.fileURLProvider.provideURL([props.html], 'text/html');
    const exportService = ReportExportServiceProviderImpl.forKey(format);
    const ExportForm = exportService ? exportService.exportForm : null;

    return (
        <Dialog
            hidden={!props.isOpen}
            onDismiss={onDismiss}
            dialogContentProps={{
                type: DialogType.normal,
                title: 'Provide result description',
                subText: 'Optional: please describe the result (it will be saved in the report).',
            }}
            modalProps={{
                isBlocking: false,
                containerClassName: 'insights-dialog-main-override',
            }}
        >
            <TextField
                multiline
                autoFocus
                rows={8}
                resizable={false}
                onChange={onDescriptionChange}
                value={props.description}
                ariaLabel="Provide result description"
            />
            <DialogFooter>
                <PrimaryButton
                    text="Export"
                    split
                    splitButtonAriaLabel="Export HTML to any of these format options"
                    aria-roledescription="split button"
                    menuProps={{
                        items: ReportExportServiceProviderImpl.all().map(service => ({
                            key: service.key,
                            text: service.displayName,
                            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
                                onExportLinkClick(e, service.key);
                            },
                        })),
                    }}
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                        onExportLinkClick(e, 'download');
                    }}
                    download={props.fileName}
                    href={fileURL}
                />
                {ExportForm && (
                    <ExportForm
                        fileName={props.fileName}
                        description={props.description}
                        html={props.html}
                        onSubmit={() => {
                            setFormat(null);
                        }}
                    />
                )}
            </DialogFooter>
        </Dialog>
    );
});
