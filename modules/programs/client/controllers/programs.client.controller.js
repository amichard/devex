(function () {
	'use strict';
	angular.module('programs')
	// =========================================================================
	//
	// Controller for the master list of programs
	//
	// =========================================================================
	.controller('ProgramsListController', function (ProgramsService) {
		var vm      = this;
		vm.programs = ProgramsService.query();
	})
	// =========================================================================
	//
	// Controller the view of the program page
	//
	// =========================================================================
	.controller('ProgramViewController', function ($scope, $state, $sce, program, Authentication, ProgramsService, Notification) {
		var vm             = this;
		vm.program         = program;
		vm.program.description = $sce.trustAsHtml(vm.program.description);
		vm.authentication  = Authentication;
		vm.ProgramsService = ProgramsService;
		vm.idString        = 'programId';
		vm.showMember      = Authentication.user && program.userIs.gov && !program.userIs.member && !program.userIs.request;
		vm.isAdmin                 = Authentication.user && !!~Authentication.user.roles.indexOf ('admin');
		vm.isGov                   = Authentication.user && !!~Authentication.user.roles.indexOf ('gov');		vm.opportunity.description = $sce.trustAsHtml(vm.opportunity.description);
		vm.request         = function () {
			ProgramsService.makeRequest ({
				programId: program._id
			}).$promise.then (function () {
				Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Membership request sent successfully!' });
			});
		};
		console.log ('program = ', program);
	})
	// =========================================================================
	//
	// Controller the view of the program page
	//
	// =========================================================================
	.controller('ProgramEditController', function ($scope, $state, $sce, $window, program, editing, Authentication, Notification) {
		var vm            = this;
		vm.isAdmin                 = Authentication.user && !!~Authentication.user.roles.indexOf ('admin');
		vm.isGov                   = Authentication.user && !!~Authentication.user.roles.indexOf ('gov');
		vm.editing        = editing;
		vm.program        = program;
		vm.authentication = Authentication;
		vm.form           = {};
		vm.program.taglist = vm.program.tags? vm.program.tags.join (', ') : '';
		vm.filename = {name:'none'};
		vm.tinymceOptions = {
			resize      : true,
			width       : '100%',  // I *think* its a number and not '400' string
			height      : 100,
			menubar     :'',
			elementpath : false,
			plugins     : 'textcolor lists advlist',
			toolbar     : 'undo redo | styleselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor'
		};
		// -------------------------------------------------------------------------
		//
		// remove the program with some confirmation
		//
		// -------------------------------------------------------------------------
		vm.remove = function () {
			if ($window.confirm('Are you sure you want to delete?')) {
				vm.program.$remove(function() {
					$state.go('programs.list');
					Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> program deleted successfully!' });
				});
			}
		};
		// -------------------------------------------------------------------------
		//
		// save the program, could be added or edited (post or put)
		//
		// -------------------------------------------------------------------------
		vm.saveme = function () {
			this.save (true);
		};
		vm.save = function (isValid) {
			console.log ('saving form');
			if (!isValid) {
				$scope.$broadcast('show-errors-check-validity', 'vm.form.programForm');
				return false;
			}
			vm.program.tags = vm.program.taglist.split(/ *, */);
			//
			// Create a new program, or update the current instance
			//
			vm.program.createOrUpdate ()
			//
			// success, notify and return to list
			//
			.then (function (res) {
				console.log ('now saved the new program, redirect user');
				Notification.success ({
					message : '<i class="glyphicon glyphicon-ok"></i> program saved successfully!'
				});
				if (editing) {
					$state.go('programs.view', {programId:program._id});
				} else {
					$state.go('programs.list');
				}
			})
			//
			// fail, notify and stay put
			//
			.catch (function (res) {
				Notification.error ({
					message : res.data.message,
					title   : '<i class=\'glyphicon glyphicon-remove\'></i> program save error!'
				});
			});
		};
	})
	;
}());
