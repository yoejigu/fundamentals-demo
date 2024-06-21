"use strict";

import * as aws from "@pulumi/aws"
import * as pulumi from "@pulumi/pulumi"

const config = new pulumi.Config()
const vpcNetworkCidr = config.get("vpcNetworkCidr") || "10.0.0.0/16";

export class NetworkComponent extends pulumi.ComponentResource {

    public readonly vpcId!: pulumi.Output<string>;
    public readonly subnetId!: pulumi.Output<string>;
    public readonly secGroupId!: pulumi.Output<string>;

    constructor(netname : string, vpcComponentsArgs?:{}, opts?: pulumi.ComponentResourceOptions ){

        super("yte:networkcr:NetworkComponent", netname);

        // Create VPC.
        const vpc = new aws.ec2.Vpc("vpc", {
            cidrBlock: vpcNetworkCidr,
            enableDnsHostnames: true,
            enableDnsSupport: true,
        },
        {
            parent: this
        });
        this.vpcId = vpc.id;


        // Create an internet gateway.
        const gateway = new aws.ec2.InternetGateway("gateway", {
            vpcId: vpc.id
        },
        {
            parent: this
        });

        // Create a subnet that automatically assigns new instances a public IP address.
        const subnet = new aws.ec2.Subnet("subnet", {
            vpcId: vpc.id,
            cidrBlock: "10.0.1.0/24",
            mapPublicIpOnLaunch: true,
        },
        {
            parent: this
        });
        this.subnetId = subnet.id;
        // Create a route table.
        const routeTable = new aws.ec2.RouteTable("routeTable", {
            vpcId: vpc.id,
            routes: [{
                cidrBlock: "0.0.0.0/0",
                gatewayId: gateway.id,
            }],
        },
        {
            parent: this
        });

        // Associate the route table with the public subnet.
        const routeTableAssociation = new aws.ec2.RouteTableAssociation("routeTableAssociation", {
            subnetId: subnet.id,
            routeTableId: routeTable.id,
        },
        {
            parent: this
        });

        // Create a security group allowing inbound access over port 80 and outbound
        // access to anywhere.
        const secGroup = new aws.ec2.SecurityGroup("secGroup", {
            description: "Enable HTTP access",
            vpcId: vpc.id,
            ingress: [{
                fromPort: 80,
                toPort: 80,
                protocol: "tcp",
                cidrBlocks: ["0.0.0.0/0"],
            }],
            egress: [{
                fromPort: 0,
                toPort: 0,
                protocol: "-1",
                cidrBlocks: ["0.0.0.0/0"],
            }],

        },
        {
            parent: this
        });
        this.secGroupId = secGroup.id

        this.registerOutputs();
    }
    

}

module.exports.NetworkComponent = NetworkComponent;