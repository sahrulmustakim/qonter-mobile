import {BluetoothEscposPrinter} from "react-native-bluetooth-escpos-printer";

export async function printReceipt(data) {
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.setBlob(0);
    await  BluetoothEscposPrinter.printText("广州俊烨\n\r",{
        encoding:'GBK',
        codepage:0,
        widthtimes:3,
        heigthtimes:3,
        fonttype:1
    });
    await BluetoothEscposPrinter.setBlob(0);
    await  BluetoothEscposPrinter.printText("销售单\n\r",{
        encoding:'GBK',
        codepage:0,
        widthtimes:0,
        heigthtimes:0,
        fonttype:1
    });
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await  BluetoothEscposPrinter.printText("客户：零售客户\n\r",{});
    await  BluetoothEscposPrinter.printText("单号：xsd201909210000001\n\r",{});
    await  BluetoothEscposPrinter.printText("日期："+new Date()+"\n\r",{});
    await  BluetoothEscposPrinter.printText("销售员：18664896621\n\r",{});
    await  BluetoothEscposPrinter.printText("--------------------------------\n\r",{});
    let columnWidths = [12,6,6,8];
    await BluetoothEscposPrinter.printColumn(columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.RIGHT],
        ["商品",'数量','单价','金额'],{});
    await BluetoothEscposPrinter.printColumn(columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.RIGHT],
        ["React-Native定制开发我是比较长的位置你稍微看看是不是这样?",'1','32000','32000'],{});
    await  BluetoothEscposPrinter.printText("\n\r",{});
    await BluetoothEscposPrinter.printColumn(columnWidths,
        [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.CENTER,BluetoothEscposPrinter.ALIGN.RIGHT],
        ["React-Native定制开发我是比较长的位置你稍微看看是不是这样?",'1','32000','32000'],{});
    await  BluetoothEscposPrinter.printText("\n\r",{});
    await  BluetoothEscposPrinter.printText("--------------------------------\n\r",{});
    await BluetoothEscposPrinter.printColumn([12,8,12],
        [BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.LEFT,BluetoothEscposPrinter.ALIGN.RIGHT],
        ["合计",'2','64000'],{});
    await  BluetoothEscposPrinter.printText("\n\r",{});
    await  BluetoothEscposPrinter.printText("折扣率：100%\n\r",{});
    await  BluetoothEscposPrinter.printText("折扣后应收：64000.00\n\r",{});
    await  BluetoothEscposPrinter.printText("会员卡支付：0.00\n\r",{});
    await  BluetoothEscposPrinter.printText("积分抵扣：0.00\n\r",{});
    await  BluetoothEscposPrinter.printText("支付金额：64000.00\n\r",{});
    await  BluetoothEscposPrinter.printText("结算账户：现金账户\n\r",{});
    await  BluetoothEscposPrinter.printText("备注：无\n\r",{});
    await  BluetoothEscposPrinter.printText("快递单号：无\n\r",{});
    await  BluetoothEscposPrinter.printText("打印时间："+(new Date())+"\n\r",{});
    await  BluetoothEscposPrinter.printText("--------------------------------\n\r",{});
    await  BluetoothEscposPrinter.printText("电话：\n\r",{});
    await  BluetoothEscposPrinter.printText("地址:\n\r\n\r",{});
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await  BluetoothEscposPrinter.printText("欢迎下次光临\n\r\n\r\n\r",{});
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
}